/**
 * GitHub GraphQL Client Tests
 * 
 * Unit tests for the GitHub GraphQL API client using mocked fetch responses.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  resolveToken,
  hasToken,
  parseRepository,
  graphqlRequest,
  listDiscussionCategories,
  listDiscussions,
  getDiscussion,
  findCategoryByName,
  GitHubAPIError,
} from '../../../../pipeline/integrations/github/graphql.js';

// =============================================================================
// Mock Setup
// =============================================================================

// Store original env
const originalEnv = { ...process.env };

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  // Reset mocks
  mockFetch.mockReset();
  // Clear env vars
  delete process.env.GITHUB_TOKEN;
  delete process.env.GH_TOKEN;
});

afterEach(() => {
  // Restore env
  process.env = { ...originalEnv };
});

// Helper to create mock response
function mockResponse(data: unknown, status = 200, headers: Record<string, string> = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Map(Object.entries(headers)),
    json: async () => data,
  };
}

// =============================================================================
// Token Resolution Tests
// =============================================================================

describe('resolveToken', () => {
  it('should return GITHUB_TOKEN when set', () => {
    process.env.GITHUB_TOKEN = 'test-token-123';
    expect(resolveToken()).toBe('test-token-123');
  });

  it('should return GH_TOKEN when GITHUB_TOKEN is not set', () => {
    process.env.GH_TOKEN = 'gh-token-456';
    expect(resolveToken()).toBe('gh-token-456');
  });

  it('should prefer GITHUB_TOKEN over GH_TOKEN', () => {
    process.env.GITHUB_TOKEN = 'github-token';
    process.env.GH_TOKEN = 'gh-token';
    expect(resolveToken()).toBe('github-token');
  });

  it('should throw GitHubAPIError when no token is available', () => {
    expect(() => resolveToken()).toThrow(GitHubAPIError);
    expect(() => resolveToken()).toThrow('GitHub token not found');
  });
});

describe('hasToken', () => {
  it('should return true when GITHUB_TOKEN is set', () => {
    process.env.GITHUB_TOKEN = 'test-token';
    expect(hasToken()).toBe(true);
  });

  it('should return true when GH_TOKEN is set', () => {
    process.env.GH_TOKEN = 'test-token';
    expect(hasToken()).toBe(true);
  });

  it('should return false when no token is set', () => {
    expect(hasToken()).toBe(false);
  });
});

// =============================================================================
// Repository Parsing Tests
// =============================================================================

describe('parseRepository', () => {
  it('should parse valid owner/repo format', () => {
    const result = parseRepository('terrence-giggy/speculum-principum');
    expect(result).toEqual({
      owner: 'terrence-giggy',
      name: 'speculum-principum',
    });
  });

  it('should handle simple repo names', () => {
    const result = parseRepository('owner/repo');
    expect(result).toEqual({ owner: 'owner', name: 'repo' });
  });

  it('should throw for invalid format without slash', () => {
    expect(() => parseRepository('invalid')).toThrow(GitHubAPIError);
    expect(() => parseRepository('invalid')).toThrow('Invalid repository format');
  });

  it('should throw for empty parts', () => {
    expect(() => parseRepository('/repo')).toThrow(GitHubAPIError);
    expect(() => parseRepository('owner/')).toThrow(GitHubAPIError);
  });

  it('should throw for too many parts', () => {
    expect(() => parseRepository('a/b/c')).toThrow(GitHubAPIError);
  });
});

// =============================================================================
// GraphQL Request Tests
// =============================================================================

describe('graphqlRequest', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token';
  });

  it('should make a successful GraphQL request', async () => {
    const responseData = { repository: { name: 'test-repo' } };
    mockFetch.mockResolvedValueOnce(mockResponse({ data: responseData }));

    const result = await graphqlRequest<typeof responseData>('query { test }');

    expect(result).toEqual(responseData);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should pass variables in request body', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ data: {} }));

    await graphqlRequest('query Test($id: ID!) { test(id: $id) }', { id: '123' });

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.variables).toEqual({ id: '123' });
  });

  it('should throw on 401 unauthorized', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}, 401));

    await expect(graphqlRequest('query { test }')).rejects.toThrow('Authentication failed');
  });

  it('should throw on rate limit exceeded (403 with X-RateLimit-Remaining: 0)', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({}, 403, { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '1700000000' })
    );

    await expect(graphqlRequest('query { test }')).rejects.toThrow('rate limit exceeded');
  });

  it('should throw on 403 without rate limit', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}, 403));

    await expect(graphqlRequest('query { test }')).rejects.toThrow('Access forbidden');
  });

  it('should throw on GraphQL errors', async () => {
    const errorResponse = {
      data: null,
      errors: [{ message: 'Field not found' }, { message: 'Another error' }],
    };
    mockFetch.mockResolvedValueOnce(mockResponse(errorResponse));

    await expect(graphqlRequest('query { test }')).rejects.toThrow('Field not found');
  });

  it('should throw when no data is returned', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({}));

    await expect(graphqlRequest('query { test }')).rejects.toThrow('No data returned');
  });
});

// =============================================================================
// Discussion Category Tests
// =============================================================================

describe('listDiscussionCategories', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token';
  });

  it('should fetch and return discussion categories', async () => {
    const categories = [
      { id: 'cat1', name: 'People', slug: 'people', description: 'People category', isAnswerable: false },
      { id: 'cat2', name: 'Organizations', slug: 'organizations', description: 'Org category', isAnswerable: false },
    ];

    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: {
            discussionCategories: { nodes: categories },
          },
        },
      })
    );

    const result = await listDiscussionCategories('owner/repo');

    expect(result).toEqual(categories);
    expect(result).toHaveLength(2);
  });

  it('should throw when repository not found', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({ data: { repository: null } })
    );

    await expect(listDiscussionCategories('owner/nonexistent')).rejects.toThrow('Repository not found');
  });
});

// =============================================================================
// List Discussions Tests
// =============================================================================

describe('listDiscussions', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token';
  });

  it('should fetch discussions with pagination info', async () => {
    const discussions = [
      {
        id: 'd1',
        number: 1,
        title: 'Niccolo Machiavelli',
        body: '# Content',
        url: 'https://github.com/...',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-02T00:00:00Z',
        category: { id: 'cat1', name: 'People', slug: 'people' },
        author: { login: 'user1' },
      },
    ];

    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: {
            discussions: {
              totalCount: 10,
              pageInfo: { hasNextPage: true, endCursor: 'cursor123' },
              nodes: discussions,
            },
          },
        },
      })
    );

    const result = await listDiscussions('owner/repo', 'categoryId123', 50);

    expect(result.nodes).toEqual(discussions);
    expect(result.totalCount).toBe(10);
    expect(result.pageInfo.hasNextPage).toBe(true);
    expect(result.pageInfo.endCursor).toBe('cursor123');
  });

  it('should pass cursor for pagination', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: {
            discussions: {
              totalCount: 0,
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [],
            },
          },
        },
      })
    );

    await listDiscussions('owner/repo', 'catId', 50, 'prevCursor');

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.variables.after).toBe('prevCursor');
  });

  it('should cap limit at 100', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: {
            discussions: {
              totalCount: 0,
              pageInfo: { hasNextPage: false, endCursor: null },
              nodes: [],
            },
          },
        },
      })
    );

    await listDiscussions('owner/repo', 'catId', 500);

    const callArgs = mockFetch.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.variables.first).toBe(100);
  });
});

// =============================================================================
// Get Discussion Tests
// =============================================================================

describe('getDiscussion', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token';
  });

  it('should fetch a single discussion by number', async () => {
    const discussion = {
      id: 'd1',
      number: 42,
      title: 'Niccolo Machiavelli',
      body: '# Full content here',
      url: 'https://github.com/owner/repo/discussions/42',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-02T00:00:00Z',
      category: { id: 'cat1', name: 'People', slug: 'people' },
      author: { login: 'contributor' },
    };

    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: { discussion },
        },
      })
    );

    const result = await getDiscussion('owner/repo', 42);

    expect(result).toEqual(discussion);
  });

  it('should throw when discussion not found', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: { discussion: null },
        },
      })
    );

    await expect(getDiscussion('owner/repo', 999)).rejects.toThrow('Discussion #999 not found');
  });
});

// =============================================================================
// Find Category Tests
// =============================================================================

describe('findCategoryByName', () => {
  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'test-token';
  });

  it('should find category by exact name', async () => {
    const categories = [
      { id: 'cat1', name: 'People', slug: 'people', description: '', isAnswerable: false },
      { id: 'cat2', name: 'Organizations', slug: 'orgs', description: '', isAnswerable: false },
    ];

    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: { discussionCategories: { nodes: categories } },
        },
      })
    );

    const result = await findCategoryByName('owner/repo', 'People');

    expect(result).toEqual(categories[0]);
  });

  it('should find category case-insensitively', async () => {
    const categories = [
      { id: 'cat1', name: 'People', slug: 'people', description: '', isAnswerable: false },
    ];

    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: { discussionCategories: { nodes: categories } },
        },
      })
    );

    const result = await findCategoryByName('owner/repo', 'PEOPLE');

    expect(result).toEqual(categories[0]);
  });

  it('should return null when category not found', async () => {
    mockFetch.mockResolvedValueOnce(
      mockResponse({
        data: {
          repository: { discussionCategories: { nodes: [] } },
        },
      })
    );

    const result = await findCategoryByName('owner/repo', 'NonExistent');

    expect(result).toBeNull();
  });
});
