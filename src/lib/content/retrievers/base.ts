/**
 * Content Retriever - Base Interface
 * 
 * Abstract interface for content retrievers that fetch content from external sources.
 * Each retriever implementation handles a specific source type (e.g., github-discussions).
 */

import type { RawContent, SourceConfig, TopicConfig } from '../types.js';

/**
 * Result of a retrieval operation for a single topic
 */
export interface RetrievalResult {
  /** Topic that was retrieved */
  topic: TopicConfig;
  /** Retrieved content items */
  items: RawContent[];
  /** Number of items retrieved */
  count: number;
  /** Duration in milliseconds */
  duration: number;
  /** Any errors encountered (non-fatal) */
  errors: string[];
}

/**
 * Abstract interface for content retrievers
 * 
 * Implementations should:
 * - Fetch content from a specific source type
 * - Convert source data to RawContent format
 * - Handle pagination and rate limits
 * - Generate URL-safe slugs from titles
 */
export interface ContentRetriever {
  /** Unique identifier for this retriever type */
  readonly name: string;
  
  /**
   * Retrieve content for a specific topic from the source
   * @param source - The source configuration
   * @param topic - The topic/category to retrieve
   * @returns Array of raw content items
   */
  retrieve(source: SourceConfig, topic: TopicConfig): Promise<RetrievalResult>;
  
  /**
   * Retrieve content for all topics in a source
   * @param source - The source configuration
   * @returns Array of retrieval results, one per topic
   */
  retrieveAll(source: SourceConfig): Promise<RetrievalResult[]>;
  
  /**
   * Check if the retriever can connect to the source
   * @param source - The source configuration
   * @returns True if connection is possible
   */
  canConnect(source: SourceConfig): Promise<boolean>;
}

/**
 * Base class providing common functionality for retrievers
 */
export abstract class BaseRetriever implements ContentRetriever {
  abstract readonly name: string;
  
  abstract retrieve(source: SourceConfig, topic: TopicConfig): Promise<RetrievalResult>;
  
  /**
   * Retrieve all topics for a source
   * Default implementation calls retrieve() for each topic sequentially
   */
  async retrieveAll(source: SourceConfig): Promise<RetrievalResult[]> {
    const results: RetrievalResult[] = [];
    
    for (const topic of source.topics) {
      const result = await this.retrieve(source, topic);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Check if connection is possible
   * Default implementation returns true - override for specific checks
   */
  async canConnect(_source: SourceConfig): Promise<boolean> {
    return true;
  }
}

// =============================================================================
// Slug Generation Utilities
// =============================================================================

/**
 * Generate a URL-safe slug from a title
 * 
 * @param title - The title to convert
 * @returns URL-safe slug
 * 
 * @example
 * generateSlug('Niccolò Machiavelli') // 'niccolo-machiavelli'
 * generateSlug('The Catholic Church') // 'the-catholic-church'
 * generateSlug('U.S. Congress') // 'us-congress'
 */
export function generateSlug(title: string): string {
  return title
    // Normalize unicode characters (é → e, ö → o, etc.)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Convert to lowercase
    .toLowerCase()
    // Replace non-alphanumeric chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    // Collapse multiple hyphens
    .replace(/-{2,}/g, '-');
}

/**
 * Generate a checksum for content change detection
 * Uses a simple hash - in production, use crypto.createHash('sha256')
 * 
 * @param content - The content to hash
 * @returns Hex string checksum
 */
export function generateChecksum(content: string): string {
  // Simple hash for change detection
  // Node.js crypto is used for actual implementation
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Convert to hex and pad to ensure consistent length
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return hex;
}

/**
 * Generate a SHA-256 checksum using Node.js crypto
 * This is the preferred method for production use
 */
export async function generateSHA256Checksum(content: string): Promise<string> {
  // Use Web Crypto API (available in Node.js 18+)
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
