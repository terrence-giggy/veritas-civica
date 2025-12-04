/**
 * GitHub GraphQL API Client
 * 
 * Lean client for interacting with GitHub's GraphQL API, specifically
 * for fetching GitHub Discussions content.
 */

// =============================================================================
// Types
// =============================================================================

/**
 * GitHub Discussion Category
 */
export interface DiscussionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  isAnswerable: boolean;
}

/**
 * GitHub Discussion with full content
 */
export interface Discussion {
  id: string;
  number: number;
  title: string;
  body: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  author: {
    login: string;
  } | null;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  nodes: T[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  totalCount: number;
}

/**
 * GitHub GraphQL error response
 */
export interface GitHubGraphQLError {
  message: string;
  type?: string;
  path?: string[];
  locations?: Array<{ line: number; column: number }>;
}

/**
 * Custom error class for GitHub API errors
 */
export class GitHubAPIError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly errors?: GitHubGraphQLError[]
  ) {
    super(message);
    this.name = 'GitHubAPIError';
  }
}

// =============================================================================
// Token Resolution
// =============================================================================

/**
 * Resolve GitHub token from environment variables
 * Checks GITHUB_TOKEN first, then GH_TOKEN
 * @returns The token or throws if not found
 */
export function resolveToken(): string {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new GitHubAPIError(
      'GitHub token not found. Set GITHUB_TOKEN or GH_TOKEN environment variable.'
    );
  }
  return token;
}

/**
 * Check if a token is available without throwing
 */
export function hasToken(): boolean {
  return !!(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
}

// =============================================================================
// GraphQL Client
// =============================================================================

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

/**
 * Execute a GraphQL query against GitHub's API
 * @param query - GraphQL query string
 * @param variables - Query variables
 * @returns The data portion of the response
 */
export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const token = resolveToken();

  const response = await fetch(GITHUB_GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'veritas-civica-content-sync',
    },
    body: JSON.stringify({ query, variables }),
  });

  // Handle HTTP errors
  if (!response.ok) {
    if (response.status === 401) {
      throw new GitHubAPIError('Authentication failed. Check your GitHub token.', 401);
    }
    if (response.status === 403) {
      const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitRemaining === '0') {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const resetDate = resetTime ? new Date(parseInt(resetTime) * 1000) : null;
        throw new GitHubAPIError(
          `GitHub API rate limit exceeded. Resets at ${resetDate?.toISOString() || 'unknown'}`,
          403
        );
      }
      throw new GitHubAPIError('Access forbidden. Check token permissions.', 403);
    }
    throw new GitHubAPIError(`GitHub API request failed: ${response.statusText}`, response.status);
  }

  const json = await response.json() as { data?: T; errors?: GitHubGraphQLError[] };

  // Handle GraphQL errors
  if (json.errors && json.errors.length > 0) {
    const errorMessages = json.errors.map((e) => e.message).join('; ');
    throw new GitHubAPIError(`GraphQL errors: ${errorMessages}`, undefined, json.errors);
  }

  if (!json.data) {
    throw new GitHubAPIError('No data returned from GitHub API');
  }

  return json.data;
}

// =============================================================================
// Repository Parsing
// =============================================================================

/**
 * Parse a repository string into owner and name
 * @param repo - Repository in 'owner/repo' format
 * @returns Object with owner and name
 */
export function parseRepository(repo: string): { owner: string; name: string } {
  const parts = repo.split('/');
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    throw new GitHubAPIError(`Invalid repository format: "${repo}". Expected "owner/repo"`);
  }
  return { owner: parts[0], name: parts[1] };
}

// =============================================================================
// Discussion Queries
// =============================================================================

/**
 * Get all discussion categories for a repository
 */
export async function listDiscussionCategories(
  repo: string
): Promise<DiscussionCategory[]> {
  const { owner, name } = parseRepository(repo);

  const query = `
    query ListDiscussionCategories($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        discussionCategories(first: 25) {
          nodes {
            id
            name
            slug
            description
            isAnswerable
          }
        }
      }
    }
  `;

  interface Response {
    repository: {
      discussionCategories: {
        nodes: DiscussionCategory[];
      };
    } | null;
  }

  const data = await graphqlRequest<Response>(query, { owner, name });

  if (!data.repository) {
    throw new GitHubAPIError(`Repository not found: ${repo}`);
  }

  return data.repository.discussionCategories.nodes;
}

/**
 * List discussions in a specific category
 * @param repo - Repository in 'owner/repo' format
 * @param categoryId - The GraphQL ID of the category
 * @param limit - Maximum number of discussions to fetch (default: 100)
 * @param cursor - Pagination cursor for fetching next page
 */
export async function listDiscussions(
  repo: string,
  categoryId: string,
  limit: number = 100,
  cursor?: string
): Promise<PaginatedResponse<Discussion>> {
  const { owner, name } = parseRepository(repo);

  const query = `
    query ListDiscussions($owner: String!, $name: String!, $categoryId: ID!, $first: Int!, $after: String) {
      repository(owner: $owner, name: $name) {
        discussions(categoryId: $categoryId, first: $first, after: $after, orderBy: {field: UPDATED_AT, direction: DESC}) {
          totalCount
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            id
            number
            title
            body
            url
            createdAt
            updatedAt
            category {
              id
              name
              slug
            }
            author {
              login
            }
          }
        }
      }
    }
  `;

  interface Response {
    repository: {
      discussions: {
        totalCount: number;
        pageInfo: {
          hasNextPage: boolean;
          endCursor: string | null;
        };
        nodes: Discussion[];
      };
    } | null;
  }

  const data = await graphqlRequest<Response>(query, {
    owner,
    name,
    categoryId,
    first: Math.min(limit, 100), // GitHub caps at 100 per page
    after: cursor || null,
  });

  if (!data.repository) {
    throw new GitHubAPIError(`Repository not found: ${repo}`);
  }

  return {
    nodes: data.repository.discussions.nodes,
    pageInfo: data.repository.discussions.pageInfo,
    totalCount: data.repository.discussions.totalCount,
  };
}

/**
 * Fetch all discussions in a category (handles pagination)
 * @param repo - Repository in 'owner/repo' format
 * @param categoryId - The GraphQL ID of the category
 * @param maxItems - Maximum total items to fetch (default: 1000)
 */
export async function listAllDiscussions(
  repo: string,
  categoryId: string,
  maxItems: number = 1000
): Promise<Discussion[]> {
  const allDiscussions: Discussion[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore && allDiscussions.length < maxItems) {
    const remaining = maxItems - allDiscussions.length;
    const pageSize = Math.min(remaining, 100);

    const response = await listDiscussions(repo, categoryId, pageSize, cursor);
    allDiscussions.push(...response.nodes);

    hasMore = response.pageInfo.hasNextPage;
    cursor = response.pageInfo.endCursor || undefined;
  }

  return allDiscussions;
}

/**
 * Get a single discussion by number
 * @param repo - Repository in 'owner/repo' format
 * @param discussionNumber - The discussion number
 */
export async function getDiscussion(
  repo: string,
  discussionNumber: number
): Promise<Discussion> {
  const { owner, name } = parseRepository(repo);

  const query = `
    query GetDiscussion($owner: String!, $name: String!, $number: Int!) {
      repository(owner: $owner, name: $name) {
        discussion(number: $number) {
          id
          number
          title
          body
          url
          createdAt
          updatedAt
          category {
            id
            name
            slug
          }
          author {
            login
          }
        }
      }
    }
  `;

  interface Response {
    repository: {
      discussion: Discussion | null;
    } | null;
  }

  const data = await graphqlRequest<Response>(query, {
    owner,
    name,
    number: discussionNumber,
  });

  if (!data.repository) {
    throw new GitHubAPIError(`Repository not found: ${repo}`);
  }

  if (!data.repository.discussion) {
    throw new GitHubAPIError(`Discussion #${discussionNumber} not found in ${repo}`);
  }

  return data.repository.discussion;
}

/**
 * Find a category by name
 * @param repo - Repository in 'owner/repo' format
 * @param categoryName - The name of the category to find
 */
export async function findCategoryByName(
  repo: string,
  categoryName: string
): Promise<DiscussionCategory | null> {
  const categories = await listDiscussionCategories(repo);
  return categories.find(
    (c) => c.name.toLowerCase() === categoryName.toLowerCase()
  ) || null;
}
