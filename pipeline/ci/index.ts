/**
 * CI Utilities Module
 * 
 * Provides utilities for running the content pipeline in CI environments,
 * particularly GitHub Actions. Handles output formatting, git operations,
 * and PR metadata generation.
 */

import { execSync } from 'child_process';
import { appendFileSync, existsSync } from 'fs';
import type { SyncResult } from '../types.js';

// =============================================================================
// Environment Detection
// =============================================================================

/**
 * Check if running in a CI environment
 */
export function isCI(): boolean {
  return process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
}

/**
 * Check if running in GitHub Actions specifically
 */
export function isGitHubActions(): boolean {
  return process.env.GITHUB_ACTIONS === 'true';
}

// =============================================================================
// GitHub Actions Outputs
// =============================================================================

/**
 * Write a key-value pair to GitHub Actions output
 * @see https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#setting-an-output-parameter
 */
export function writeGitHubOutput(key: string, value: string): void {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) {
    // Fallback for local testing - just log it
    console.log(`::set-output name=${key}::${value}`);
    return;
  }
  
  // Handle multiline values
  if (value.includes('\n')) {
    const delimiter = `EOF_${Date.now()}`;
    appendFileSync(outputFile, `${key}<<${delimiter}\n${value}\n${delimiter}\n`);
  } else {
    appendFileSync(outputFile, `${key}=${value}\n`);
  }
}

/**
 * Append markdown content to GitHub Actions step summary
 * @see https://docs.github.com/en/actions/using-workflows/workflow-commands-for-github-actions#adding-a-job-summary
 */
export function writeGitHubSummary(markdown: string): void {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) {
    // Fallback for local testing - just log it
    console.log('\n--- Step Summary ---');
    console.log(markdown);
    console.log('-------------------\n');
    return;
  }
  
  appendFileSync(summaryFile, markdown + '\n');
}

// =============================================================================
// Git Operations
// =============================================================================

/**
 * Configure git for CI commits
 */
export function configureGit(): void {
  execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
  execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'inherit' });
}

/**
 * Stage content directory for commit
 */
export function stageContent(contentPath: string = 'content/'): void {
  execSync(`git add ${contentPath}`, { stdio: 'inherit' });
}

/**
 * Check if there are staged or unstaged changes in a path
 */
export function hasChanges(path: string = 'content/'): boolean {
  try {
    execSync(`git diff --quiet ${path}`, { stdio: 'pipe' });
    // Also check staged changes
    execSync(`git diff --cached --quiet ${path}`, { stdio: 'pipe' });
    return false;
  } catch {
    return true;
  }
}

/**
 * Get a summary of changes for logging
 */
export function getChangesSummary(path: string = 'content/'): string {
  try {
    return execSync(`git diff --stat ${path}`, { encoding: 'utf-8' });
  } catch {
    return '';
  }
}

// =============================================================================
// PR Metadata Generation
// =============================================================================

export interface PRMetadata {
  title: string;
  body: string;
  commitMessage: string;
  branch: string;
  labels: string[];
}

export interface CIContext {
  source?: string;
  topic?: string;
  trigger: string;
  runId: string;
  runUrl: string;
  repository: string;
  timestamp: string;
}

/**
 * Get CI context from environment variables
 */
export function getCIContext(options: { source?: string; topic?: string } = {}): CIContext {
  const repository = process.env.GITHUB_REPOSITORY || 'unknown/unknown';
  const runId = process.env.GITHUB_RUN_ID || '0';
  const serverUrl = process.env.GITHUB_SERVER_URL || 'https://github.com';
  
  return {
    source: options.source,
    topic: options.topic,
    trigger: process.env.GITHUB_EVENT_NAME || 'manual',
    runId,
    runUrl: `${serverUrl}/${repository}/actions/runs/${runId}`,
    repository,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate PR metadata from sync results and CI context
 */
export function generatePRMetadata(results: SyncResult[], context: CIContext): PRMetadata {
  const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated.length, 0);
  const totalUnchanged = results.reduce((sum, r) => sum + r.unchanged.length, 0);
  const successfulSources = results.filter(r => r.success).length;

  // Build commit message
  let commitMessage = 'chore: sync content from discussions';
  if (context.source) {
    commitMessage += ` (source: ${context.source})`;
  }
  if (context.topic) {
    commitMessage += ` (topic: ${context.topic})`;
  }
  commitMessage += `\n\nAutomated content sync at ${context.timestamp}\n`;
  commitMessage += `\nTriggered by: ${context.trigger}`;
  commitMessage += `\nRun: ${context.runUrl}`;

  // Build PR body
  const body = `## Automated Content Sync

This PR was automatically generated by the content sync workflow.

### Summary
| Metric | Count |
|--------|-------|
| Sources | ${successfulSources}/${results.length} successful |
| Created | ${totalCreated} |
| Updated | ${totalUpdated} |
| Unchanged | ${totalUnchanged} |

### Details
- **Source:** ${context.source || 'all'}
- **Topic:** ${context.topic || 'all'}
- **Trigger:** ${context.trigger}
- **Run:** [${context.runId}](${context.runUrl})

### Changes
Content files in \`content/\` directory have been updated from GitHub Discussions.

${formatChangesDetails(results)}

---
*This PR will be automatically merged if all checks pass.*`;

  return {
    title: 'chore: automated content sync',
    body,
    commitMessage,
    branch: 'automated/content-sync',
    labels: ['automated', 'content-sync'],
  };
}

function formatChangesDetails(results: SyncResult[]): string {
  const lines: string[] = [];
  
  for (const result of results) {
    if (result.created.length > 0 || result.updated.length > 0) {
      lines.push(`#### ${result.source}`);
      
      if (result.created.length > 0) {
        lines.push('**Created:**');
        for (const item of result.created) {
          lines.push(`- \`${item.category}/${item.slug}\`: ${item.title}`);
        }
      }
      
      if (result.updated.length > 0) {
        lines.push('**Updated:**');
        for (const item of result.updated) {
          lines.push(`- \`${item.category}/${item.slug}\`: ${item.title}`);
        }
      }
      
      lines.push('');
    }
  }
  
  return lines.length > 0 ? lines.join('\n') : '_No content changes in this sync._';
}

// =============================================================================
// Summary Generation
// =============================================================================

export interface SummaryOptions {
  dryRun: boolean;
  hasChanges: boolean;
  source?: string;
  topic?: string;
  trigger: string;
  results: SyncResult[];
}

/**
 * Generate a markdown summary for GitHub Actions
 */
export function generateSummary(options: SummaryOptions): string {
  const { dryRun, hasChanges, source, topic, trigger, results } = options;
  
  const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated.length, 0);
  const totalUnchanged = results.reduce((sum, r) => sum + r.unchanged.length, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const successfulSources = results.filter(r => r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0);

  let status: string;
  if (dryRun) {
    status = '🔍 **Dry Run Mode** - No changes committed';
  } else if (hasChanges) {
    status = '✅ **Content Updated** - Pull request created';
  } else {
    status = 'ℹ️ **No Changes** - Content is already up to date';
  }

  return `## Content Sync Summary

${status}

### Results

| Metric | Value |
|--------|-------|
| Sources | ${successfulSources}/${results.length} successful |
| Created | ${totalCreated} |
| Updated | ${totalUpdated} |
| Unchanged | ${totalUnchanged} |
| Errors | ${totalErrors} |
| Duration | ${(totalDuration / 1000).toFixed(2)}s |

### Configuration

- **Source:** ${source || 'all'}
- **Topic:** ${topic || 'all'}
- **Trigger:** ${trigger}

${totalErrors > 0 ? formatErrors(results) : ''}`;
}

function formatErrors(results: SyncResult[]): string {
  const errors = results.flatMap(r => r.errors);
  if (errors.length === 0) return '';
  
  const lines = ['### Errors', ''];
  for (const error of errors) {
    lines.push(`- **${error.title || error.slug}**: ${error.error}`);
  }
  return lines.join('\n');
}
