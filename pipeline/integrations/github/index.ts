/**
 * GitHub Integration Module
 * 
 * Exports for GitHub API interactions.
 */

export {
  // Types
  type DiscussionCategory,
  type Discussion,
  type PaginatedResponse,
  type GitHubGraphQLError,
  GitHubAPIError,
  
  // Token utilities
  resolveToken,
  hasToken,
  
  // GraphQL client
  graphqlRequest,
  parseRepository,
  
  // Discussion queries
  listDiscussionCategories,
  listDiscussions,
  listAllDiscussions,
  getDiscussion,
  findCategoryByName,
} from './graphql.js';
