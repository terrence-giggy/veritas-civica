/**
 * Content Storage Tests
 * 
 * Unit tests for the content storage handler.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ContentStorage } from '$lib/content/storage.js';
import type { RawContent, SyncState } from '$lib/content/types.js';

// =============================================================================
// Test Setup
// =============================================================================

const TEST_BASE_DIR = 'test-content/raw';
const TEST_SYNC_STATE_PATH = 'test-content/.sync-state.json';

// Helper to create test content
function createTestContent(overrides: Partial<RawContent> = {}): RawContent {
  return {
    source: 'test-source',
    sourceType: 'github-discussions',
    category: 'People',
    title: 'Test Person',
    slug: 'test-person',
    discussionNumber: 1,
    discussionUrl: 'https://github.com/test/repo/discussions/1',
    retrievedAt: '2025-11-28T12:00:00Z',
    updatedAt: '2025-11-28T10:00:00Z',
    checksum: 'abc123',
    body: '# Test Person\n\nTest content.',
    ...overrides,
  };
}

describe('ContentStorage', () => {
  let storage: ContentStorage;

  beforeEach(async () => {
    // Create test directory
    await mkdir(TEST_BASE_DIR, { recursive: true });
    storage = new ContentStorage(TEST_BASE_DIR, TEST_SYNC_STATE_PATH);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm('test-content', { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  // ===========================================================================
  // Content Operations Tests
  // ===========================================================================

  describe('writeContent', () => {
    it('should write content to JSON file', async () => {
      const content = createTestContent();
      const filePath = await storage.writeContent(content);

      expect(filePath).toContain('test-person.json');
      
      const fileContent = await readFile(filePath, 'utf-8');
      const parsed = JSON.parse(fileContent);
      expect(parsed.title).toBe('Test Person');
      expect(parsed.slug).toBe('test-person');
    });

    it('should create category directory if not exists', async () => {
      const content = createTestContent({ category: 'Organizations', slug: 'test-org' });
      const filePath = await storage.writeContent(content);

      expect(filePath).toContain('organizations');
      expect(filePath).toContain('test-org.json');
    });

    it('should overwrite existing content', async () => {
      const content1 = createTestContent({ body: 'Original content' });
      await storage.writeContent(content1);

      const content2 = createTestContent({ body: 'Updated content' });
      await storage.writeContent(content2);

      const read = await storage.readContent('People', 'test-person');
      expect(read?.body).toBe('Updated content');
    });

    it('should format JSON with pretty printing', async () => {
      const content = createTestContent();
      const filePath = await storage.writeContent(content);

      const fileContent = await readFile(filePath, 'utf-8');
      expect(fileContent).toContain('\n'); // Has newlines
      expect(fileContent).toContain('  '); // Has indentation
    });
  });

  describe('readContent', () => {
    it('should read existing content', async () => {
      const content = createTestContent();
      await storage.writeContent(content);

      const read = await storage.readContent('People', 'test-person');
      expect(read).not.toBeNull();
      expect(read?.title).toBe('Test Person');
      expect(read?.body).toBe('# Test Person\n\nTest content.');
    });

    it('should return null for non-existent content', async () => {
      const read = await storage.readContent('People', 'non-existent');
      expect(read).toBeNull();
    });

    it('should handle case-insensitive category lookup', async () => {
      const content = createTestContent({ category: 'People' });
      await storage.writeContent(content);

      // Category is normalized to lowercase in storage
      const read = await storage.readContent('people', 'test-person');
      expect(read).not.toBeNull();
    });
  });

  describe('listContent', () => {
    it('should list all content in a category', async () => {
      await storage.writeContent(createTestContent({ slug: 'person-1', title: 'Person 1' }));
      await storage.writeContent(createTestContent({ slug: 'person-2', title: 'Person 2' }));
      await storage.writeContent(createTestContent({ slug: 'person-3', title: 'Person 3' }));

      const contents = await storage.listContent('People');
      expect(contents).toHaveLength(3);
      expect(contents.map(c => c.slug).sort()).toEqual(['person-1', 'person-2', 'person-3']);
    });

    it('should return empty array for non-existent category', async () => {
      const contents = await storage.listContent('NonExistent');
      expect(contents).toEqual([]);
    });

    it('should not include non-JSON files', async () => {
      await storage.writeContent(createTestContent());
      
      // Create a non-JSON file
      const categoryDir = join(TEST_BASE_DIR, 'people');
      await writeFile(join(categoryDir, 'readme.txt'), 'Not JSON', 'utf-8');

      const contents = await storage.listContent('People');
      expect(contents).toHaveLength(1);
    });
  });

  describe('listSlugs', () => {
    it('should list all slugs without loading content', async () => {
      await storage.writeContent(createTestContent({ slug: 'alpha' }));
      await storage.writeContent(createTestContent({ slug: 'beta' }));

      const slugs = await storage.listSlugs('People');
      expect(slugs.sort()).toEqual(['alpha', 'beta']);
    });

    it('should return empty array for non-existent category', async () => {
      const slugs = await storage.listSlugs('NonExistent');
      expect(slugs).toEqual([]);
    });
  });

  describe('contentExists', () => {
    it('should return true for existing content', async () => {
      await storage.writeContent(createTestContent());
      const exists = await storage.contentExists('People', 'test-person');
      expect(exists).toBe(true);
    });

    it('should return false for non-existent content', async () => {
      const exists = await storage.contentExists('People', 'non-existent');
      expect(exists).toBe(false);
    });
  });

  describe('deleteContent', () => {
    it('should delete existing content', async () => {
      await storage.writeContent(createTestContent());
      
      const deleted = await storage.deleteContent('People', 'test-person');
      expect(deleted).toBe(true);

      const exists = await storage.contentExists('People', 'test-person');
      expect(exists).toBe(false);
    });

    it('should return false for non-existent content', async () => {
      const deleted = await storage.deleteContent('People', 'non-existent');
      expect(deleted).toBe(false);
    });
  });

  // ===========================================================================
  // Sync State Tests
  // ===========================================================================

  describe('getSyncState', () => {
    it('should return default state when no file exists', async () => {
      const state = await storage.getSyncState();
      
      expect(state.version).toBe(1);
      expect(state.sources).toEqual({});
      expect(state.lastFullSync).toBeNull();
    });

    it('should read existing sync state', async () => {
      const existingState: SyncState = {
        version: 1,
        sources: {
          'test-source': {
            lastSync: '2025-11-28T10:00:00Z',
            checksums: { 'test-slug': 'abc123' },
            lastSyncCount: 5,
          },
        },
        lastFullSync: '2025-11-28T10:00:00Z',
      };

      await mkdir('test-content', { recursive: true });
      await writeFile(TEST_SYNC_STATE_PATH, JSON.stringify(existingState), 'utf-8');

      const state = await storage.getSyncState();
      expect(state.sources['test-source']).toBeDefined();
      expect(state.sources['test-source'].lastSyncCount).toBe(5);
    });
  });

  describe('updateSyncState', () => {
    it('should write sync state to file', async () => {
      const state: SyncState = {
        version: 1,
        sources: {
          'my-source': {
            lastSync: '2025-11-28T12:00:00Z',
            checksums: {},
            lastSyncCount: 10,
          },
        },
        lastFullSync: '2025-11-28T12:00:00Z',
      };

      await storage.updateSyncState(state);

      const read = await storage.getSyncState();
      expect(read.sources['my-source'].lastSyncCount).toBe(10);
    });
  });

  describe('getSourceSyncState', () => {
    it('should return source state if exists', async () => {
      const state: SyncState = {
        version: 1,
        sources: {
          'existing-source': {
            lastSync: '2025-11-28T10:00:00Z',
            checksums: { slug1: 'hash1' },
            lastSyncCount: 3,
          },
        },
        lastFullSync: null,
      };
      await storage.updateSyncState(state);

      const sourceState = await storage.getSourceSyncState('existing-source');
      expect(sourceState.lastSyncCount).toBe(3);
    });

    it('should return default state for unknown source', async () => {
      const sourceState = await storage.getSourceSyncState('unknown-source');
      
      expect(sourceState.lastSync).toBeNull();
      expect(sourceState.checksums).toEqual({});
      expect(sourceState.lastSyncCount).toBe(0);
    });
  });

  // ===========================================================================
  // Content Diffing Tests
  // ===========================================================================

  describe('diffContent', () => {
    it('should identify new content', async () => {
      const newContent = [createTestContent({ slug: 'new-person' })];
      
      const { created, updated, unchanged } = await storage.diffContent(newContent, 'People');
      
      expect(created).toHaveLength(1);
      expect(created[0].slug).toBe('new-person');
      expect(created[0].status).toBe('created');
      expect(updated).toHaveLength(0);
      expect(unchanged).toHaveLength(0);
    });

    it('should identify updated content', async () => {
      // Write original content
      await storage.writeContent(createTestContent({ checksum: 'old-hash' }));
      
      // Diff with new content (different checksum)
      const newContent = [createTestContent({ checksum: 'new-hash' })];
      const { created, updated, unchanged } = await storage.diffContent(newContent, 'People');
      
      expect(created).toHaveLength(0);
      expect(updated).toHaveLength(1);
      expect(updated[0].slug).toBe('test-person');
      expect(updated[0].status).toBe('updated');
      expect(unchanged).toHaveLength(0);
    });

    it('should identify unchanged content', async () => {
      // Write original content
      await storage.writeContent(createTestContent({ checksum: 'same-hash' }));
      
      // Diff with same content
      const newContent = [createTestContent({ checksum: 'same-hash' })];
      const { created, updated, unchanged } = await storage.diffContent(newContent, 'People');
      
      expect(created).toHaveLength(0);
      expect(updated).toHaveLength(0);
      expect(unchanged).toHaveLength(1);
      expect(unchanged[0].slug).toBe('test-person');
      expect(unchanged[0].status).toBe('unchanged');
    });

    it('should handle mixed changes', async () => {
      // Write some existing content
      await storage.writeContent(createTestContent({ slug: 'existing-unchanged', checksum: 'hash1' }));
      await storage.writeContent(createTestContent({ slug: 'existing-changed', checksum: 'old-hash' }));
      
      // New content with mix of states
      const newContent = [
        createTestContent({ slug: 'existing-unchanged', checksum: 'hash1' }), // unchanged
        createTestContent({ slug: 'existing-changed', checksum: 'new-hash' }), // updated
        createTestContent({ slug: 'brand-new', checksum: 'hash3' }), // created
      ];
      
      const { created, updated, unchanged } = await storage.diffContent(newContent, 'People');
      
      expect(created).toHaveLength(1);
      expect(updated).toHaveLength(1);
      expect(unchanged).toHaveLength(1);
    });
  });

  describe('syncContent', () => {
    it('should write new and updated content', async () => {
      const contents = [
        createTestContent({ slug: 'person-1' }),
        createTestContent({ slug: 'person-2' }),
      ];

      const result = await storage.syncContent(contents);

      expect(result.created).toHaveLength(2);
      expect(result.updated).toHaveLength(0);
      expect(result.unchanged).toHaveLength(0);
      expect(result.errors).toHaveLength(0);

      // Verify files were written
      const read1 = await storage.readContent('People', 'person-1');
      const read2 = await storage.readContent('People', 'person-2');
      expect(read1).not.toBeNull();
      expect(read2).not.toBeNull();
    });

    it('should not write files in dry run mode', async () => {
      const contents = [createTestContent({ slug: 'dry-run-test' })];

      const result = await storage.syncContent(contents, true);

      expect(result.created).toHaveLength(1);
      
      // File should NOT exist
      const exists = await storage.contentExists('People', 'dry-run-test');
      expect(exists).toBe(false);
    });

    it('should skip unchanged content', async () => {
      // Write initial content
      await storage.writeContent(createTestContent({ slug: 'unchanged', checksum: 'same' }));

      // Sync with same checksum
      const contents = [createTestContent({ slug: 'unchanged', checksum: 'same' })];
      const result = await storage.syncContent(contents);

      expect(result.created).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
      expect(result.unchanged).toHaveLength(1);
    });
  });
});
