/**
 * GitHub Discussions Content Retriever
 * 
 * Retrieves content from GitHub Discussions and converts it to RawContent format.
 */

import type { RawContent, SourceConfig, TopicConfig } from '../types.js';
import type { RetrievalResult } from './base.js';
import { BaseRetriever, generateSlug, generateSHA256Checksum } from './base.js';
import {
  findCategoryByName,
  listAllDiscussions,
  hasToken,
  type Discussion,
  type DiscussionCategory,
} from '../../integrations/github/index.js';

/**
 * Retriever for GitHub Discussions content
 * 
 * Fetches discussions from specified categories in a GitHub repository
 * and converts them to the RawContent format for local storage.
 */
export class GitHubDiscussionsRetriever extends BaseRetriever {
  readonly name = 'github-discussions';
  
  // Cache for category lookups to avoid repeated API calls
  private categoryCache: Map<string, DiscussionCategory | null> = new Map();
  
  /**
   * Retrieve content for a specific topic (category) from GitHub Discussions
   */
  async retrieve(source: SourceConfig, topic: TopicConfig): Promise<RetrievalResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const items: RawContent[] = [];
    
    try {
      // Find the category in the repository
      const category = await this.getCategory(source.connection.repository, topic.category);
      
      if (!category) {
        errors.push(`Category "${topic.category}" not found in ${source.connection.repository}`);
        return {
          topic,
          items: [],
          count: 0,
          duration: Date.now() - startTime,
          errors,
        };
      }
      
      // Fetch all discussions in the category
      const discussions = await listAllDiscussions(
        source.connection.repository,
        category.id
      );
      
      // Convert discussions to RawContent format
      for (const discussion of discussions) {
        try {
          const content = await this.discussionToRawContent(
            discussion,
            source,
            topic
          );
          items.push(content);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          errors.push(`Failed to convert discussion #${discussion.number}: ${message}`);
        }
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`Retrieval failed: ${message}`);
    }
    
    return {
      topic,
      items,
      count: items.length,
      duration: Date.now() - startTime,
      errors,
    };
  }
  
  /**
   * Check if we can connect to the GitHub API
   */
  async canConnect(source: SourceConfig): Promise<boolean> {
    if (!hasToken()) {
      return false;
    }
    
    try {
      // Try to list categories as a connection test
      const category = await findCategoryByName(
        source.connection.repository,
        source.topics[0]?.category || 'General'
      );
      // Even if category is null, we connected successfully
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get a category, using cache to avoid repeated API calls
   */
  private async getCategory(
    repository: string,
    categoryName: string
  ): Promise<DiscussionCategory | null> {
    const cacheKey = `${repository}:${categoryName}`;
    
    if (this.categoryCache.has(cacheKey)) {
      return this.categoryCache.get(cacheKey) || null;
    }
    
    const category = await findCategoryByName(repository, categoryName);
    this.categoryCache.set(cacheKey, category);
    return category;
  }
  
  /**
   * Convert a GitHub Discussion to RawContent format
   */
  private async discussionToRawContent(
    discussion: Discussion,
    source: SourceConfig,
    topic: TopicConfig
  ): Promise<RawContent> {
    // Generate slug from the field specified in topic config
    const slugSource = topic.slugFrom === 'title' ? discussion.title : discussion.title;
    const slug = generateSlug(slugSource);
    
    // Generate checksum from body content
    const checksum = await generateSHA256Checksum(discussion.body);
    
    return {
      // Metadata
      source: source.name,
      sourceType: source.type,
      category: topic.category,
      title: discussion.title,
      slug,
      discussionNumber: discussion.number,
      discussionUrl: discussion.url,
      retrievedAt: new Date().toISOString(),
      updatedAt: discussion.updatedAt,
      checksum,
      
      // Content
      body: discussion.body,
    };
  }
  
  /**
   * Clear the category cache (useful for testing or long-running processes)
   */
  clearCache(): void {
    this.categoryCache.clear();
  }
}

/**
 * Singleton instance of the GitHub Discussions retriever
 */
export const githubDiscussionsRetriever = new GitHubDiscussionsRetriever();
