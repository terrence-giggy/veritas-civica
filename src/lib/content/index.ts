/**
 * Content Retrieval System - Module Exports
 * 
 * Central export point for the content retrieval system.
 */

// Type exports
export type {
  SourceConfig,
  TopicConfig,
  RawContent,
  SourceSyncState,
  SyncState,
  SyncItemResult,
  SyncResult,
} from './types.js';

// Configuration exports
export {
  speculumPrincipum,
  sources,
  getEnabledSources,
  getSourceByName,
  getAllCategories,
  validateSourceConfig,
} from './config.js';

// Retriever exports
export type { ContentRetriever, RetrievalResult } from './retrievers/index.js';
export {
  BaseRetriever,
  generateSlug,
  generateChecksum,
  generateSHA256Checksum,
  GitHubDiscussionsRetriever,
  githubDiscussionsRetriever,
  getRetriever,
  getRetrieverByType,
  getAvailableRetrieverTypes,
  registerRetriever,
} from './retrievers/index.js';

// Storage exports
export {
  ContentStorage,
  contentStorage,
  writeContent,
  readContent,
  listContent,
  getSyncState,
  updateSyncState,
} from './storage.js';

// Loader exports (for SvelteKit routes)
export type {
  ContentSummary,
  ContentDetail,
} from './loader.js';
export {
  loadAllContent,
  loadContent,
  getAllSlugs,
  hasContent,
  getContentCount,
} from './loader.js';
