/**
 * Content Retrieval System - Source Configuration
 * 
 * Defines content sources and provides helper functions for accessing them.
 */

import type { SourceConfig } from './types.js';

// =============================================================================
// Source Definitions
// =============================================================================

/**
 * Speculum Principum - Knowledge graph repository with People and Organizations
 * GitHub repository: terrence-giggy/speculum-principum
 */
export const speculumPrincipum: SourceConfig = {
  name: 'speculum-principum',
  type: 'github-discussions',
  enabled: true,
  connection: {
    repository: 'terrence-giggy/speculum-principum',
  },
  topics: [
    {
      category: 'People',
      outputPath: 'people/',
      slugFrom: 'title',
    },
    {
      category: 'Organizations',
      outputPath: 'organizations/',
      slugFrom: 'title',
    },
  ],
  sync: {
    incremental: true,
  },
};

// =============================================================================
// Source Registry
// =============================================================================

/**
 * All configured content sources
 * Add new sources to this array as they are implemented
 */
export const sources: SourceConfig[] = [
  speculumPrincipum,
];

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get all enabled content sources
 * @returns Array of enabled source configurations
 */
export function getEnabledSources(): SourceConfig[] {
  return sources.filter((source) => source.enabled);
}

/**
 * Get a specific source by name
 * @param name - The unique name of the source
 * @returns The source configuration or undefined if not found
 */
export function getSourceByName(name: string): SourceConfig | undefined {
  return sources.find((source) => source.name === name);
}

/**
 * Get all topic categories across all enabled sources
 * @returns Array of unique category names
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  for (const source of getEnabledSources()) {
    for (const topic of source.topics) {
      categories.add(topic.category);
    }
  }
  return Array.from(categories);
}

/**
 * Validate a source configuration
 * @param source - The source configuration to validate
 * @returns Object with isValid boolean and array of error messages
 */
export function validateSourceConfig(source: SourceConfig): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!source.name || source.name.trim() === '') {
    errors.push('Source name is required');
  }

  if (source.type !== 'github-discussions') {
    errors.push(`Unsupported source type: ${source.type}`);
  }

  if (!source.connection.repository) {
    errors.push('Repository is required');
  } else if (!source.connection.repository.includes('/')) {
    errors.push('Repository must be in owner/repo format');
  }

  if (!source.topics || source.topics.length === 0) {
    errors.push('At least one topic is required');
  }

  for (const topic of source.topics) {
    if (!topic.category) {
      errors.push('Topic category is required');
    }
    if (!topic.outputPath) {
      errors.push('Topic outputPath is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
