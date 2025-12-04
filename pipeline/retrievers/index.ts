/**
 * Content Retrievers - Factory and Exports
 * 
 * Central module for content retriever management.
 */

import type { SourceConfig } from '../types.js';
import type { ContentRetriever } from './base.js';
import { GitHubDiscussionsRetriever, githubDiscussionsRetriever } from './github-discussions.js';

// Re-export base types and utilities
export type { ContentRetriever, RetrievalResult } from './base.js';
export { BaseRetriever, generateSlug, generateChecksum, generateSHA256Checksum } from './base.js';

// Re-export retriever implementations
export { GitHubDiscussionsRetriever, githubDiscussionsRetriever } from './github-discussions.js';

/**
 * Map of source types to retriever instances
 */
const retrieverMap: Record<string, ContentRetriever> = {
  'github-discussions': githubDiscussionsRetriever,
};

/**
 * Get a retriever for a specific source configuration
 * 
 * @param source - The source configuration
 * @returns The appropriate retriever for the source type
 * @throws Error if no retriever is available for the source type
 * 
 * @example
 * const retriever = getRetriever(speculumPrincipum);
 * const results = await retriever.retrieveAll(speculumPrincipum);
 */
export function getRetriever(source: SourceConfig): ContentRetriever {
  const retriever = retrieverMap[source.type];
  
  if (!retriever) {
    throw new Error(
      `No retriever available for source type: "${source.type}". ` +
      `Available types: ${Object.keys(retrieverMap).join(', ')}`
    );
  }
  
  return retriever;
}

/**
 * Get a retriever by type name
 * 
 * @param type - The source type (e.g., 'github-discussions')
 * @returns The retriever or undefined if not found
 */
export function getRetrieverByType(type: string): ContentRetriever | undefined {
  return retrieverMap[type];
}

/**
 * Get all available retriever types
 * 
 * @returns Array of available source type names
 */
export function getAvailableRetrieverTypes(): string[] {
  return Object.keys(retrieverMap);
}

/**
 * Register a custom retriever
 * 
 * @param type - The source type this retriever handles
 * @param retriever - The retriever instance
 */
export function registerRetriever(type: string, retriever: ContentRetriever): void {
  retrieverMap[type] = retriever;
}
