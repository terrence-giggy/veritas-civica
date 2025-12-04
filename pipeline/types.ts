/**
 * Content Pipeline - Type Definitions
 * 
 * Core TypeScript interfaces for the content retrieval and storage system.
 */

// =============================================================================
// Source Configuration Types
// =============================================================================

/**
 * Configuration for a content source (e.g., GitHub repository with discussions)
 */
export interface SourceConfig {
  /** Unique identifier for the source */
  name: string;
  /** Type of content retriever to use */
  type: 'github-discussions';
  /** Whether this source is active for syncing */
  enabled: boolean;
  /** Connection details for the source */
  connection: {
    /** Repository in 'owner/repo' format */
    repository: string;
    // Token resolved from GITHUB_TOKEN or GH_TOKEN env var
  };
  /** Topics/categories to retrieve from this source */
  topics: TopicConfig[];
  /** Sync behavior configuration */
  sync: {
    /** Only fetch discussions updated since last sync */
    incremental: boolean;
  };
}

/**
 * Configuration for a specific topic/category within a source
 */
export interface TopicConfig {
  /** Category name in the source (e.g., 'People', 'Organizations') */
  category: string;
  /** Local output path for content (e.g., 'people/', 'organizations/') */
  outputPath: string;
  /** Field to generate URL slug from */
  slugFrom: 'title';
}

// =============================================================================
// Raw Content Types
// =============================================================================

/**
 * Raw content retrieved from a source and stored as JSON
 */
export interface RawContent {
  // Metadata
  /** Source identifier (e.g., 'speculum-principum') */
  source: string;
  /** Type of source (e.g., 'github-discussions') */
  sourceType: string;
  /** Category within the source (e.g., 'People', 'Organizations') */
  category: string;
  /** Content title */
  title: string;
  /** URL-safe slug generated from title */
  slug: string;
  /** Discussion number in the source */
  discussionNumber: number;
  /** Full URL to the source discussion */
  discussionUrl: string;
  /** ISO timestamp when content was retrieved */
  retrievedAt: string;
  /** ISO timestamp when content was last updated in source */
  updatedAt: string;
  /** SHA-256 hash of body content for change detection */
  checksum: string;
  
  // Content
  /** Raw markdown content from the discussion body */
  body: string;
}

// =============================================================================
// Sync State Types
// =============================================================================

/**
 * Sync state for a single source
 */
export interface SourceSyncState {
  /** ISO timestamp of last successful sync */
  lastSync: string | null;
  /** Map of slug -> checksum for all synced content */
  checksums: Record<string, string>;
  /** Number of items synced in last run */
  lastSyncCount: number;
}

/**
 * Global sync state persisted to .sync-state.json
 */
export interface SyncState {
  /** Schema version for migration support */
  version: number;
  /** Per-source sync state */
  sources: Record<string, SourceSyncState>;
  /** ISO timestamp of last full sync across all sources */
  lastFullSync: string | null;
}

// =============================================================================
// Sync Result Types
// =============================================================================

/**
 * Result of a sync operation for a single content item
 */
export interface SyncItemResult {
  slug: string;
  title: string;
  category: string;
  status: 'created' | 'updated' | 'unchanged' | 'error';
  error?: string;
}

/**
 * Result of a sync operation for an entire source
 */
export interface SyncResult {
  source: string;
  success: boolean;
  /** Items that were newly created */
  created: SyncItemResult[];
  /** Items that were updated (content changed) */
  updated: SyncItemResult[];
  /** Items that were unchanged (same checksum) */
  unchanged: SyncItemResult[];
  /** Items that failed to sync */
  errors: SyncItemResult[];
  /** Duration of sync in milliseconds */
  duration: number;
  /** ISO timestamp when sync completed */
  syncedAt: string;
}
