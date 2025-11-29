/**
 * Content Loader Tests
 * 
 * Tests for the SvelteKit content loading utilities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fs from 'node:fs/promises';
import type { RawContent } from '../../../src/lib/content/types.js';

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(),
  readdir: vi.fn(),
}));

// Import after mocking
const { loadAllContent, loadContent, getAllSlugs, hasContent, getContentCount } = await import('../../../src/lib/content/loader.js');

// =============================================================================
// Test Fixtures
// =============================================================================

const mockPerson: RawContent = {
  source: 'speculum-principum',
  sourceType: 'github-discussions',
  category: 'People',
  title: 'Marcus Aurelius',
  slug: 'marcus-aurelius',
  discussionNumber: 1,
  discussionUrl: 'https://github.com/terrence-giggy/speculum-principum/discussions/1',
  retrievedAt: '2025-11-28T10:00:00.000Z',
  updatedAt: '2025-11-28T09:00:00.000Z',
  checksum: 'abc123',
  body: '# Marcus Aurelius\n\nRoman Emperor and Stoic philosopher from 161 to 180 AD.',
};

const mockOrganization: RawContent = {
  source: 'speculum-principum',
  sourceType: 'github-discussions',
  category: 'Organizations',
  title: 'Roman Senate',
  slug: 'roman-senate',
  discussionNumber: 2,
  discussionUrl: 'https://github.com/terrence-giggy/speculum-principum/discussions/2',
  retrievedAt: '2025-11-28T10:00:00.000Z',
  updatedAt: '2025-11-28T09:00:00.000Z',
  checksum: 'def456',
  body: '## Roman Senate\n\nThe governing body of ancient Rome that lasted for centuries.',
};

// =============================================================================
// loadAllContent Tests
// =============================================================================

describe('loadAllContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when directory does not exist', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readdir).mockRejectedValue(error);

    const result = await loadAllContent('people');

    expect(result).toEqual([]);
  });

  it('should load all content files in a category', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['marcus-aurelius.json', 'julius-caesar.json'] as any);
    vi.mocked(fs.readFile).mockImplementation((path) => {
      if (String(path).includes('marcus-aurelius')) {
        return Promise.resolve(JSON.stringify(mockPerson));
      }
      return Promise.resolve(JSON.stringify({ ...mockPerson, title: 'Julius Caesar', slug: 'julius-caesar' }));
    });

    const result = await loadAllContent('people');

    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('julius-caesar'); // Sorted alphabetically
    expect(result[1].slug).toBe('marcus-aurelius');
  });

  it('should filter non-JSON files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['person.json', '.gitkeep', 'readme.md'] as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPerson));

    const result = await loadAllContent('people');

    expect(result).toHaveLength(1);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
  });

  it('should skip invalid JSON files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['valid.json', 'invalid.json'] as any);
    vi.mocked(fs.readFile).mockImplementation((path) => {
      if (String(path).includes('invalid')) {
        return Promise.reject(new Error('Invalid JSON'));
      }
      return Promise.resolve(JSON.stringify(mockPerson));
    });

    const result = await loadAllContent('people');

    expect(result).toHaveLength(1);
  });

  it('should return content summaries without full body', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['person.json'] as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPerson));

    const result = await loadAllContent('people');

    expect(result[0]).toHaveProperty('slug');
    expect(result[0]).toHaveProperty('title');
    expect(result[0]).toHaveProperty('excerpt');
    expect(result[0]).not.toHaveProperty('body');
  });

  it('should generate excerpt from body', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['person.json'] as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPerson));

    const result = await loadAllContent('people');

    expect(result[0].excerpt).toContain('Roman Emperor');
  });
});

// =============================================================================
// loadContent Tests
// =============================================================================

describe('loadContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load a single content item', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPerson));

    const result = await loadContent('people', 'marcus-aurelius');

    expect(result).not.toBeNull();
    expect(result!.slug).toBe('marcus-aurelius');
    expect(result!.title).toBe('Marcus Aurelius');
  });

  it('should return null when content not found', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readFile).mockRejectedValue(error);

    const result = await loadContent('people', 'nonexistent');

    expect(result).toBeNull();
  });

  it('should include full body in detail', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPerson));

    const result = await loadContent('people', 'marcus-aurelius');

    expect(result).toHaveProperty('body');
    expect(result!.body).toContain('Roman Emperor');
  });

  it('should include retrieval metadata', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockPerson));

    const result = await loadContent('people', 'marcus-aurelius');

    expect(result).toHaveProperty('retrievedAt');
    expect(result).toHaveProperty('discussionNumber');
    expect(result).toHaveProperty('discussionUrl');
  });

  it('should throw on non-ENOENT errors', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('Permission denied'));

    await expect(loadContent('people', 'test')).rejects.toThrow('Permission denied');
  });
});

// =============================================================================
// getAllSlugs Tests
// =============================================================================

describe('getAllSlugs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all slugs in a category', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['marcus-aurelius.json', 'julius-caesar.json'] as any);

    const result = await getAllSlugs('people');

    expect(result).toEqual(['marcus-aurelius', 'julius-caesar']);
  });

  it('should return empty array when directory does not exist', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readdir).mockRejectedValue(error);

    const result = await getAllSlugs('people');

    expect(result).toEqual([]);
  });

  it('should filter non-JSON files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['person.json', '.gitkeep'] as any);

    const result = await getAllSlugs('people');

    expect(result).toEqual(['person']);
  });
});

// =============================================================================
// hasContent Tests
// =============================================================================

describe('hasContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return true when content exists', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['person.json'] as any);

    const result = await hasContent('people');

    expect(result).toBe(true);
  });

  it('should return false when no content exists', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['.gitkeep'] as any);

    const result = await hasContent('people');

    expect(result).toBe(false);
  });

  it('should return false when directory does not exist', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readdir).mockRejectedValue(error);

    const result = await hasContent('people');

    expect(result).toBe(false);
  });
});

// =============================================================================
// getContentCount Tests
// =============================================================================

describe('getContentCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return count of content files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['a.json', 'b.json', 'c.json'] as any);

    const result = await getContentCount('people');

    expect(result).toBe(3);
  });

  it('should return 0 when directory does not exist', async () => {
    const error = new Error('ENOENT') as NodeJS.ErrnoException;
    error.code = 'ENOENT';
    vi.mocked(fs.readdir).mockRejectedValue(error);

    const result = await getContentCount('people');

    expect(result).toBe(0);
  });

  it('should not count non-JSON files', async () => {
    vi.mocked(fs.readdir).mockResolvedValue(['a.json', '.gitkeep', 'readme.md'] as any);

    const result = await getContentCount('people');

    expect(result).toBe(1);
  });
});

// =============================================================================
// Excerpt Generation Tests
// =============================================================================

describe('excerpt generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should remove markdown headers from excerpt', async () => {
    const content = { ...mockPerson, body: '# Title\n\nThis is the content.' };
    vi.mocked(fs.readdir).mockResolvedValue(['test.json'] as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(content));

    const result = await loadAllContent('people');

    expect(result[0].excerpt).not.toContain('#');
    expect(result[0].excerpt).toContain('This is the content.');
  });

  it('should remove markdown links but keep text', async () => {
    const content = { ...mockPerson, body: 'Check out [this link](https://example.com) for more.' };
    vi.mocked(fs.readdir).mockResolvedValue(['test.json'] as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(content));

    const result = await loadAllContent('people');

    expect(result[0].excerpt).toContain('this link');
    expect(result[0].excerpt).not.toContain('https://');
  });

  it('should truncate long excerpts at word boundary', async () => {
    const longText = 'This is a very long text. '.repeat(20);
    const content = { ...mockPerson, body: longText };
    vi.mocked(fs.readdir).mockResolvedValue(['test.json'] as any);
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(content));

    const result = await loadAllContent('people');

    expect(result[0].excerpt.length).toBeLessThanOrEqual(210); // 200 + ellipsis + word boundary
    expect(result[0].excerpt.endsWith('...')).toBe(true);
  });
});
