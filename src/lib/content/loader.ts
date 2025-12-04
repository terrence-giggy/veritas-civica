/**
 * Content Loader for SvelteKit
 * 
 * Utilities for loading synced content at build time.
 * Used in +page.server.ts files for static generation.
 * 
 * This module provides the bridge between the pipeline's content storage
 * and SvelteKit's static page generation.
 */

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { RawContent } from '../../../pipeline/types.js';

// =============================================================================
// Constants
// =============================================================================

/** Base directory for content storage */
const CONTENT_BASE_DIR = 'content/raw';

// =============================================================================
// Types
// =============================================================================

/**
 * Content summary for listing pages (excludes full body)
 */
export interface ContentSummary {
  /** URL-safe slug */
  slug: string;
  /** Content title */
  title: string;
  /** Source name */
  source: string;
  /** Category (e.g., 'People', 'Organizations') */
  category: string;
  /** ISO timestamp when content was last updated */
  updatedAt: string;
  /** Discussion URL for attribution */
  discussionUrl: string;
  /** Preview of content (first 200 chars) */
  excerpt: string;
}

/**
 * Full content for detail pages
 */
export interface ContentDetail extends ContentSummary {
  /** Full markdown body */
  body: string;
  /** ISO timestamp when content was retrieved */
  retrievedAt: string;
  /** Discussion number for reference */
  discussionNumber: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get the directory path for a category
 */
function getCategoryDir(category: string): string {
  // Convert category to lowercase directory name
  const dirName = category.toLowerCase().replace(/\s+/g, '-');
  return join(CONTENT_BASE_DIR, dirName);
}

/**
 * Extract excerpt from markdown body
 */
function extractExcerpt(body: string, maxLength: number = 200): string {
  // Remove markdown headers
  let text = body.replace(/^#+\s+.+$/gm, '');
  // Remove markdown links but keep text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  // Remove markdown formatting
  text = text.replace(/[*_`~]/g, '');
  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate at word boundary
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...';
}

/**
 * Convert RawContent to ContentSummary
 */
function toContentSummary(content: RawContent): ContentSummary {
  return {
    slug: content.slug,
    title: content.title,
    source: content.source,
    category: content.category,
    updatedAt: content.updatedAt,
    discussionUrl: content.discussionUrl,
    excerpt: extractExcerpt(content.body),
  };
}

/**
 * Convert RawContent to ContentDetail
 */
function toContentDetail(content: RawContent): ContentDetail {
  return {
    slug: content.slug,
    title: content.title,
    source: content.source,
    category: content.category,
    updatedAt: content.updatedAt,
    discussionUrl: content.discussionUrl,
    excerpt: extractExcerpt(content.body),
    body: content.body,
    retrievedAt: content.retrievedAt,
    discussionNumber: content.discussionNumber,
  };
}

// =============================================================================
// Content Loading Functions
// =============================================================================

/**
 * Load all content summaries for a category
 * @param category - Category name (e.g., 'people', 'organizations')
 * @returns Array of content summaries sorted by title
 */
export async function loadAllContent(category: string): Promise<ContentSummary[]> {
  const dirPath = getCategoryDir(category);
  
  try {
    const files = await readdir(dirPath);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const contents: ContentSummary[] = [];
    
    for (const file of jsonFiles) {
      try {
        const filePath = join(dirPath, file);
        const json = await readFile(filePath, 'utf-8');
        const content = JSON.parse(json) as RawContent;
        contents.push(toContentSummary(content));
      } catch {
        // Skip invalid files
        console.warn(`Failed to load content file: ${file}`);
      }
    }
    
    // Sort by title alphabetically
    return contents.sort((a, b) => a.title.localeCompare(b.title));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

/**
 * Load a single content item by slug
 * @param category - Category name (e.g., 'people', 'organizations')
 * @param slug - Content slug
 * @returns Content detail or null if not found
 */
export async function loadContent(category: string, slug: string): Promise<ContentDetail | null> {
  const dirPath = getCategoryDir(category);
  const filePath = join(dirPath, `${slug}.json`);
  
  try {
    const json = await readFile(filePath, 'utf-8');
    const content = JSON.parse(json) as RawContent;
    return toContentDetail(content);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Get all slugs for a category (for prerendering)
 * @param category - Category name
 * @returns Array of slugs
 */
export async function getAllSlugs(category: string): Promise<string[]> {
  const dirPath = getCategoryDir(category);
  
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
 * Check if any content exists for a category
 * @param category - Category name
 * @returns True if content exists
 */
export async function hasContent(category: string): Promise<boolean> {
  const slugs = await getAllSlugs(category);
  return slugs.length > 0;
}

/**
 * Get content count for a category
 * @param category - Category name
 * @returns Number of content items
 */
export async function getContentCount(category: string): Promise<number> {
  const slugs = await getAllSlugs(category);
  return slugs.length;
}
