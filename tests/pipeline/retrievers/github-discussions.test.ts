/**
 * GitHub Discussions Retriever Tests
 * 
 * Unit tests for the GitHub Discussions content retriever.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  generateSlug,
  generateChecksum,
  getRetriever,
  getRetrieverByType,
  getAvailableRetrieverTypes,
  GitHubDiscussionsRetriever,
} from '../../../pipeline/retrievers/index.js';
import type { SourceConfig, TopicConfig } from '../../../pipeline/types.js';

// =============================================================================
// Slug Generation Tests
// =============================================================================

describe('generateSlug', () => {
  it('should convert simple titles to lowercase slugs', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should handle accented characters', () => {
    expect(generateSlug('Niccolò Machiavelli')).toBe('niccolo-machiavelli');
    expect(generateSlug('François Hollande')).toBe('francois-hollande');
    expect(generateSlug('José García')).toBe('jose-garcia');
  });

  it('should handle special characters', () => {
    expect(generateSlug('U.S. Congress')).toBe('u-s-congress');
    expect(generateSlug("McDonald's Corporation")).toBe('mcdonald-s-corporation');
    expect(generateSlug('AT&T Inc.')).toBe('at-t-inc');
  });

  it('should collapse multiple hyphens', () => {
    expect(generateSlug('Hello   World')).toBe('hello-world');
    expect(generateSlug('Hello---World')).toBe('hello-world');
  });

  it('should remove leading and trailing hyphens', () => {
    expect(generateSlug('  Hello World  ')).toBe('hello-world');
    expect(generateSlug('---Hello---')).toBe('hello');
  });

  it('should handle numbers', () => {
    expect(generateSlug('World War 2')).toBe('world-war-2');
    expect(generateSlug('21st Century')).toBe('21st-century');
  });

  it('should handle empty strings', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle strings with only special characters', () => {
    expect(generateSlug('...')).toBe('');
    expect(generateSlug('---')).toBe('');
  });

  it('should handle mixed case', () => {
    expect(generateSlug('ThE CaThOlIc ChUrCh')).toBe('the-catholic-church');
  });

  it('should handle Germanic umlauts', () => {
    expect(generateSlug('Müller')).toBe('muller');
    expect(generateSlug('Göring')).toBe('goring');
  });
});

// =============================================================================
// Checksum Generation Tests
// =============================================================================

describe('generateChecksum', () => {
  it('should generate consistent checksums for the same content', () => {
    const content = 'Hello World';
    const checksum1 = generateChecksum(content);
    const checksum2 = generateChecksum(content);
    expect(checksum1).toBe(checksum2);
  });

  it('should generate different checksums for different content', () => {
    const checksum1 = generateChecksum('Hello World');
    const checksum2 = generateChecksum('Hello World!');
    expect(checksum1).not.toBe(checksum2);
  });

  it('should return hex string', () => {
    const checksum = generateChecksum('test');
    expect(checksum).toMatch(/^[0-9a-f]+$/);
  });

  it('should handle empty string', () => {
    const checksum = generateChecksum('');
    expect(checksum).toBe('00000000');
  });

  it('should handle long content', () => {
    const longContent = 'a'.repeat(10000);
    const checksum = generateChecksum(longContent);
    expect(checksum).toMatch(/^[0-9a-f]+$/);
  });
});

// =============================================================================
// Retriever Factory Tests
// =============================================================================

describe('getRetriever', () => {
  it('should return GitHub Discussions retriever for github-discussions type', () => {
    const source: SourceConfig = {
      name: 'test',
      type: 'github-discussions',
      enabled: true,
      connection: { repository: 'owner/repo' },
      topics: [],
      sync: { incremental: true },
    };

    const retriever = getRetriever(source);
    expect(retriever.name).toBe('github-discussions');
  });

  it('should throw for unknown source type', () => {
    const source: SourceConfig = {
      name: 'test',
      type: 'unknown-type' as any,
      enabled: true,
      connection: { repository: 'owner/repo' },
      topics: [],
      sync: { incremental: true },
    };

    expect(() => getRetriever(source)).toThrow('No retriever available');
  });
});

describe('getRetrieverByType', () => {
  it('should return retriever for valid type', () => {
    const retriever = getRetrieverByType('github-discussions');
    expect(retriever).toBeDefined();
    expect(retriever?.name).toBe('github-discussions');
  });

  it('should return undefined for unknown type', () => {
    const retriever = getRetrieverByType('unknown');
    expect(retriever).toBeUndefined();
  });
});

describe('getAvailableRetrieverTypes', () => {
  it('should include github-discussions', () => {
    const types = getAvailableRetrieverTypes();
    expect(types).toContain('github-discussions');
  });

  it('should return an array', () => {
    const types = getAvailableRetrieverTypes();
    expect(Array.isArray(types)).toBe(true);
  });
});

// =============================================================================
// GitHubDiscussionsRetriever Tests
// =============================================================================

describe('GitHubDiscussionsRetriever', () => {
  let retriever: GitHubDiscussionsRetriever;

  beforeEach(() => {
    retriever = new GitHubDiscussionsRetriever();
  });

  afterEach(() => {
    retriever.clearCache();
  });

  it('should have correct name', () => {
    expect(retriever.name).toBe('github-discussions');
  });

  describe('retrieve', () => {
    // Note: Full integration tests would require mocking the GitHub API
    // These tests verify the structure and error handling

    it('should return error when no token is available', async () => {
      // Remove any existing tokens
      const originalGH = process.env.GH_TOKEN;
      const originalGitHub = process.env.GITHUB_TOKEN;
      delete process.env.GH_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const source: SourceConfig = {
        name: 'test',
        type: 'github-discussions',
        enabled: true,
        connection: { repository: 'owner/repo' },
        topics: [{ category: 'People', outputPath: 'people/', slugFrom: 'title' }],
        sync: { incremental: true },
      };

      const result = await retriever.retrieve(source, source.topics[0]);

      expect(result.items).toHaveLength(0);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('token');

      // Restore tokens
      if (originalGH) process.env.GH_TOKEN = originalGH;
      if (originalGitHub) process.env.GITHUB_TOKEN = originalGitHub;
    });

    it('should return RetrievalResult structure', async () => {
      // Remove tokens to trigger error path (faster than mocking full API)
      const originalGH = process.env.GH_TOKEN;
      const originalGitHub = process.env.GITHUB_TOKEN;
      delete process.env.GH_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const source: SourceConfig = {
        name: 'test-source',
        type: 'github-discussions',
        enabled: true,
        connection: { repository: 'owner/repo' },
        topics: [{ category: 'Test', outputPath: 'test/', slugFrom: 'title' }],
        sync: { incremental: true },
      };

      const result = await retriever.retrieve(source, source.topics[0]);

      // Verify structure
      expect(result).toHaveProperty('topic');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('count');
      expect(result).toHaveProperty('duration');
      expect(result).toHaveProperty('errors');
      expect(typeof result.duration).toBe('number');
      expect(Array.isArray(result.items)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);

      // Restore tokens
      if (originalGH) process.env.GH_TOKEN = originalGH;
      if (originalGitHub) process.env.GITHUB_TOKEN = originalGitHub;
    });
  });

  describe('canConnect', () => {
    it('should return false when no token is available', async () => {
      const originalGH = process.env.GH_TOKEN;
      const originalGitHub = process.env.GITHUB_TOKEN;
      delete process.env.GH_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const source: SourceConfig = {
        name: 'test',
        type: 'github-discussions',
        enabled: true,
        connection: { repository: 'owner/repo' },
        topics: [{ category: 'General', outputPath: 'general/', slugFrom: 'title' }],
        sync: { incremental: true },
      };

      const canConnect = await retriever.canConnect(source);
      expect(canConnect).toBe(false);

      if (originalGH) process.env.GH_TOKEN = originalGH;
      if (originalGitHub) process.env.GITHUB_TOKEN = originalGitHub;
    });
  });

  describe('retrieveAll', () => {
    it('should call retrieve for each topic', async () => {
      const source: SourceConfig = {
        name: 'test',
        type: 'github-discussions',
        enabled: true,
        connection: { repository: 'owner/repo' },
        topics: [
          { category: 'People', outputPath: 'people/', slugFrom: 'title' },
          { category: 'Organizations', outputPath: 'organizations/', slugFrom: 'title' },
        ],
        sync: { incremental: true },
      };

      // Spy on retrieve method
      const retrieveSpy = vi.spyOn(retriever, 'retrieve');

      // Remove tokens to trigger fast error path
      const originalGH = process.env.GH_TOKEN;
      const originalGitHub = process.env.GITHUB_TOKEN;
      delete process.env.GH_TOKEN;
      delete process.env.GITHUB_TOKEN;

      const results = await retriever.retrieveAll(source);

      expect(results).toHaveLength(2);
      expect(retrieveSpy).toHaveBeenCalledTimes(2);

      // Restore tokens
      if (originalGH) process.env.GH_TOKEN = originalGH;
      if (originalGitHub) process.env.GITHUB_TOKEN = originalGitHub;
    });
  });
});
