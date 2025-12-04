/**
 * Content Pipeline - Main Entry Point
 * 
 * Central export point for the content pipeline system.
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
} from './storage/storage.js';

// GitHub integration exports
export { hasToken } from './integrations/github/index.js';

// CI utilities exports
export {
  isCI,
  isGitHubActions,
  writeGitHubOutput,
  writeGitHubSummary,
  configureGit,
  stageContent,
  hasChanges,
  getChangesSummary,
  getCIContext,
  generatePRMetadata,
  generateSummary,
} from './ci/index.js';
export type { PRMetadata, CIContext, SummaryOptions } from './ci/index.js';
