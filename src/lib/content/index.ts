/**
 * Content Module for SvelteKit
 * 
 * Provides content loading utilities for SvelteKit routes.
 * The actual content pipeline (retrieval, storage, sync) lives in the /pipeline directory.
 * This module re-exports only what's needed for build-time page generation.
 */

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

// Re-export types from pipeline for convenience
export type {
  RawContent,
} from '../../../pipeline/types.js';
