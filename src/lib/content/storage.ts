/**
 * Content Storage Handler
 * 
 * Handles local JSON file storage for retrieved content and sync state tracking.
 */

import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { RawContent, SyncState, SourceSyncState, SyncItemResult } from './types.js';

// =============================================================================
// Constants
// =============================================================================

/** Base directory for content storage */
const CONTENT_BASE_DIR = 'content/raw';

/** Path to sync state file */
const SYNC_STATE_PATH = 'content/.sync-state.json';

/** Current sync state schema version */
const SYNC_STATE_VERSION = 1;

// =============================================================================
// Directory Utilities
// =============================================================================

/**
 * Ensure a directory exists, creating it if necessary
 */
async function ensureDir(dirPath: string): Promise<void> {
  try {
    await mkdir(dirPath, { recursive: true });
  } catch (error) {
    // Directory might already exist, which is fine
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the storage path for a category
 */
function getCategoryPath(category: string): string {
  // Convert category to lowercase directory name
  const dirName = category.toLowerCase().replace(/\s+/g, '-');
  return join(CONTENT_BASE_DIR, dirName);
}

/**
 * Get the file path for a content item
 */
function getContentFilePath(category: string, slug: string): string {
  return join(getCategoryPath(category), `${slug}.json`);
}

// =============================================================================
// Content Storage Class
// =============================================================================

/**
 * Handles reading and writing content JSON files
 */
export class ContentStorage {
  private basePath: string;
  private syncStatePath: string;

  constructor(basePath: string = CONTENT_BASE_DIR, syncStatePath: string = SYNC_STATE_PATH) {
    this.basePath = basePath;
    this.syncStatePath = syncStatePath;
  }

  // ===========================================================================
  // Content Operations
  // ===========================================================================

  /**
   * Write a content item to storage
   * @param content - The raw content to write
   * @returns The file path where content was written
   */
  async writeContent(content: RawContent): Promise<string> {
    const filePath = this.getFilePath(content.category, content.slug);
    
    // Ensure directory exists
    await ensureDir(dirname(filePath));
    
    // Write JSON with pretty formatting
    const json = JSON.stringify(content, null, 2);
    await writeFile(filePath, json, 'utf-8');
    
    return filePath;
  }

  /**
   * Read a content item from storage
   * @param category - The content category (e.g., 'People')
   * @param slug - The content slug
   * @returns The raw content or null if not found
   */
  async readContent(category: string, slug: string): Promise<RawContent | null> {
    const filePath = this.getFilePath(category, slug);
    
    try {
      const json = await readFile(filePath, 'utf-8');
      return JSON.parse(json) as RawContent;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return null;
      }
      throw error;
    }
  }

  /**
   * List all content items in a category
   * @param category - The content category
   * @returns Array of raw content items
   */
  async listContent(category: string): Promise<RawContent[]> {
    const dirPath = this.getCategoryDir(category);
    
    try {
      const files = await readdir(dirPath);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      const contents: RawContent[] = [];
      for (const file of jsonFiles) {
        const slug = file.replace('.json', '');
        const content = await this.readContent(category, slug);
        if (content) {
          contents.push(content);
        }
      }
      
      return contents;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * List all slugs in a category (without loading full content)
   * @param category - The content category
   * @returns Array of slugs
   */
  async listSlugs(category: string): Promise<string[]> {
    const dirPath = this.getCategoryDir(category);
    
    try {
      const files = await readdir(dirPath);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Check if content exists
   * @param category - The content category
   * @param slug - The content slug
   * @returns True if content exists
   */
  async contentExists(category: string, slug: string): Promise<boolean> {
    const filePath = this.getFilePath(category, slug);
    return fileExists(filePath);
  }

  /**
   * Delete a content item
   * @param category - The content category
   * @param slug - The content slug
   * @returns True if deleted, false if not found
   */
  async deleteContent(category: string, slug: string): Promise<boolean> {
    const filePath = this.getFilePath(category, slug);
    
    try {
      const { unlink } = await import('node:fs/promises');
      await unlink(filePath);
      return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return false;
      }
      throw error;
    }
  }

  // ===========================================================================
  // Sync State Operations
  // ===========================================================================

  /**
   * Get the current sync state
   * @returns The sync state or a default empty state
   */
  async getSyncState(): Promise<SyncState> {
    try {
      const json = await readFile(this.syncStatePath, 'utf-8');
      const state = JSON.parse(json) as SyncState;
      
      // Migrate if needed
      if (state.version !== SYNC_STATE_VERSION) {
        return this.migrateSyncState(state);
      }
      
      return state;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return this.getDefaultSyncState();
      }
      throw error;
    }
  }

  /**
   * Update the sync state
   * @param state - The new sync state
   */
  async updateSyncState(state: SyncState): Promise<void> {
    await ensureDir(dirname(this.syncStatePath));
    const json = JSON.stringify(state, null, 2);
    await writeFile(this.syncStatePath, json, 'utf-8');
  }

  /**
   * Get sync state for a specific source
   * @param sourceName - The source name
   * @returns The source sync state or a default empty state
   */
  async getSourceSyncState(sourceName: string): Promise<SourceSyncState> {
    const state = await this.getSyncState();
    return state.sources[sourceName] || this.getDefaultSourceSyncState();
  }

  /**
   * Update sync state for a specific source
   * @param sourceName - The source name
   * @param sourceState - The new source sync state
   */
  async updateSourceSyncState(sourceName: string, sourceState: SourceSyncState): Promise<void> {
    const state = await this.getSyncState();
    state.sources[sourceName] = sourceState;
    state.lastFullSync = new Date().toISOString();
    await this.updateSyncState(state);
  }

  // ===========================================================================
  // Content Diffing
  // ===========================================================================

  /**
   * Compare new content with existing and categorize changes
   * @param newContent - Array of new content items
   * @param category - The content category
   * @returns Object with created, updated, and unchanged items
   */
  async diffContent(
    newContent: RawContent[],
    category: string
  ): Promise<{
    created: SyncItemResult[];
    updated: SyncItemResult[];
    unchanged: SyncItemResult[];
  }> {
    const created: SyncItemResult[] = [];
    const updated: SyncItemResult[] = [];
    const unchanged: SyncItemResult[] = [];

    for (const content of newContent) {
      const existing = await this.readContent(category, content.slug);
      
      if (!existing) {
        // New content
        created.push({
          slug: content.slug,
          title: content.title,
          category: content.category,
          status: 'created',
        });
      } else if (existing.checksum !== content.checksum) {
        // Content changed
        updated.push({
          slug: content.slug,
          title: content.title,
          category: content.category,
          status: 'updated',
        });
      } else {
        // No change
        unchanged.push({
          slug: content.slug,
          title: content.title,
          category: content.category,
          status: 'unchanged',
        });
      }
    }

    return { created, updated, unchanged };
  }

  /**
   * Write multiple content items and return sync results
   * @param contents - Array of content items to write
   * @param dryRun - If true, don't actually write files
   * @returns Sync results categorized by status
   */
  async syncContent(
    contents: RawContent[],
    dryRun: boolean = false
  ): Promise<{
    created: SyncItemResult[];
    updated: SyncItemResult[];
    unchanged: SyncItemResult[];
    errors: SyncItemResult[];
  }> {
    const errors: SyncItemResult[] = [];
    
    // Group by category for diffing
    const byCategory = new Map<string, RawContent[]>();
    for (const content of contents) {
      const existing = byCategory.get(content.category) || [];
      existing.push(content);
      byCategory.set(content.category, existing);
    }

    // Diff each category
    let allCreated: SyncItemResult[] = [];
    let allUpdated: SyncItemResult[] = [];
    let allUnchanged: SyncItemResult[] = [];

    for (const [category, categoryContents] of byCategory) {
      const { created, updated, unchanged } = await this.diffContent(categoryContents, category);
      allCreated = allCreated.concat(created);
      allUpdated = allUpdated.concat(updated);
      allUnchanged = allUnchanged.concat(unchanged);
    }

    // Write files if not dry run
    if (!dryRun) {
      for (const content of contents) {
        const result = [...allCreated, ...allUpdated].find(r => r.slug === content.slug);
        if (result) {
          try {
            await this.writeContent(content);
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push({
              slug: content.slug,
              title: content.title,
              category: content.category,
              status: 'error',
              error: message,
            });
            // Remove from created/updated since it failed
            allCreated = allCreated.filter(r => r.slug !== content.slug);
            allUpdated = allUpdated.filter(r => r.slug !== content.slug);
          }
        }
      }
    }

    return {
      created: allCreated,
      updated: allUpdated,
      unchanged: allUnchanged,
      errors,
    };
  }

  // ===========================================================================
  // Private Helpers
  // ===========================================================================

  private getFilePath(category: string, slug: string): string {
    const dirName = category.toLowerCase().replace(/\s+/g, '-');
    return join(this.basePath, dirName, `${slug}.json`);
  }

  private getCategoryDir(category: string): string {
    const dirName = category.toLowerCase().replace(/\s+/g, '-');
    return join(this.basePath, dirName);
  }

  private getDefaultSyncState(): SyncState {
    return {
      version: SYNC_STATE_VERSION,
      sources: {},
      lastFullSync: null,
    };
  }

  private getDefaultSourceSyncState(): SourceSyncState {
    return {
      lastSync: null,
      checksums: {},
      lastSyncCount: 0,
    };
  }

  private migrateSyncState(oldState: SyncState): SyncState {
    // For now, just update version - add migration logic as needed
    return {
      ...oldState,
      version: SYNC_STATE_VERSION,
    };
  }
}

// =============================================================================
// Singleton Instance
// =============================================================================

/**
 * Default content storage instance
 */
export const contentStorage = new ContentStorage();

// =============================================================================
// Convenience Functions
// =============================================================================

/**
 * Write content to storage using default instance
 */
export async function writeContent(content: RawContent): Promise<string> {
  return contentStorage.writeContent(content);
}

/**
 * Read content from storage using default instance
 */
export async function readContent(category: string, slug: string): Promise<RawContent | null> {
  return contentStorage.readContent(category, slug);
}

/**
 * List all content in a category using default instance
 */
export async function listContent(category: string): Promise<RawContent[]> {
  return contentStorage.listContent(category);
}

/**
 * Get sync state using default instance
 */
export async function getSyncState(): Promise<SyncState> {
  return contentStorage.getSyncState();
}

/**
 * Update sync state using default instance
 */
export async function updateSyncState(state: SyncState): Promise<void> {
  return contentStorage.updateSyncState(state);
}
