#!/usr/bin/env npx tsx
/**
 * Content Sync CLI Script
 * 
 * Command-line interface for syncing content from external sources.
 * 
 * Usage:
 *   npx tsx pipeline/cli.ts [command] [options]
 * 
 * Commands:
 *   sync          Sync content from configured sources
 *   list-sources  Show configured sources and their status
 *   show          Display retrieved content
 * 
 * Options:
 *   --help        Show this help message
 *   --source      Sync specific source (default: all enabled)
 *   --topic       Sync specific topic (People, Organizations)
 *   --dry-run     Preview without writing files
 */

import {
  getEnabledSources,
  getSourceByName,
  sources,
  getRetriever,
  type SourceConfig,
  type SyncResult,
  type RawContent,
} from './index.js';
import { ContentStorage } from './storage/storage.js';
import { hasToken } from './integrations/github/index.js';
import {
  isCI,
  isGitHubActions,
  writeGitHubOutput,
  writeGitHubSummary,
  configureGit,
  stageContent,
  hasChanges,
  getChangesSummary,
  getCIContext,
  generatePRMetadata,
  generateSummary,
} from './ci/index.js';

// =============================================================================
// CLI Argument Parsing
// =============================================================================

interface CliArgs {
  command: string;
  source?: string;
  topic?: string;
  dryRun: boolean;
  help: boolean;
  verbose: boolean;
  args: string[];
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2); // Skip node and script path
  const result: CliArgs = {
    command: '',
    dryRun: false,
    help: false,
    verbose: false,
    args: [],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--dry-run' || arg === '-n') {
      result.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      result.verbose = true;
    } else if (arg === '--source' && i + 1 < args.length) {
      result.source = args[++i];
    } else if (arg === '--topic' && i + 1 < args.length) {
      result.topic = args[++i];
    } else if (!arg.startsWith('-')) {
      if (!result.command) {
        result.command = arg;
      } else {
        result.args.push(arg);
      }
    }
  }

  return result;
}

// =============================================================================
// Output Helpers
// =============================================================================

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message: string): void {
  console.log(message);
}

function success(message: string): void {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function warn(message: string): void {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function error(message: string): void {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function info(message: string): void {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

// =============================================================================
// Commands
// =============================================================================

function showHelp(): void {
  console.log(`
${colors.bold}Content Sync CLI${colors.reset} - Veritas Civica Content Pipeline

${colors.bold}Usage:${colors.reset}
  npx tsx pipeline/cli.ts [command] [options]

${colors.bold}Commands:${colors.reset}
  sync              Sync content from configured sources
  ci-sync           Sync content in CI mode (GitHub Actions)
  list-sources      Show configured sources and their status
  show <cat> <slug> Display retrieved content
  list [category]   List synced content

${colors.bold}Options:${colors.reset}
  -h, --help        Show this help message
  -n, --dry-run     Preview without writing files
  -v, --verbose     Show detailed output
  --source NAME     Sync specific source (default: all enabled)
  --topic TOPIC     Sync specific topic (People, Organizations)

${colors.bold}Examples:${colors.reset}
  npx tsx pipeline/cli.ts sync
  npx tsx pipeline/cli.ts sync --dry-run
  npx tsx pipeline/cli.ts sync --source speculum-principum
  npx tsx pipeline/cli.ts sync --topic People
  npx tsx pipeline/cli.ts ci-sync
  npx tsx pipeline/cli.ts list-sources
  npx tsx pipeline/cli.ts show people niccolo-machiavelli

${colors.bold}Environment:${colors.reset}
  GITHUB_TOKEN or GH_TOKEN must be set for GitHub sources.
`);
}

function listSources(): void {
  log(`\n${colors.bold}Configured Content Sources${colors.reset}\n`);
  log('─'.repeat(65));
  
  for (const source of sources) {
    const status = source.enabled ? `${colors.green}✓ Enabled${colors.reset}` : `${colors.red}✗ Disabled${colors.reset}`;
    
    log(`\n  ${status}  ${colors.bold}${source.name}${colors.reset}`);
    log(`${colors.dim}           Type:${colors.reset}   ${source.type}`);
    log(`${colors.dim}           Repo:${colors.reset}   ${source.connection.repository}`);
    log(`${colors.dim}           Topics:${colors.reset} ${source.topics.map(t => t.category).join(', ')}`);
    log(`${colors.dim}           Sync:${colors.reset}   ${source.sync.incremental ? 'Incremental' : 'Full'}`);
  }
  
  log('\n' + '─'.repeat(65));
  
  const enabled = getEnabledSources();
  log(`\nTotal: ${sources.length} source(s), ${enabled.length} enabled`);
  
  // Check token status
  if (hasToken()) {
    success('GitHub token detected');
  } else {
    warn('No GitHub token found (set GITHUB_TOKEN or GH_TOKEN)');
  }
  log('');
}

async function sync(args: CliArgs): Promise<void> {
  const startTime = Date.now();
  const storage = new ContentStorage();
  
  // Determine sources to sync
  const sourcesToSync = args.source 
    ? [getSourceByName(args.source)].filter((s): s is SourceConfig => s !== undefined)
    : getEnabledSources();

  if (sourcesToSync.length === 0) {
    error('No sources to sync');
    if (args.source) {
      error(`Source "${args.source}" not found`);
      log(`\nAvailable sources: ${sources.map(s => s.name).join(', ')}`);
    }
    process.exit(1);
  }

  // Check for GitHub token
  if (!hasToken()) {
    error('GitHub token not found');
    log('\nPlease set GITHUB_TOKEN or GH_TOKEN environment variable.');
    log('You can create a token at: https://github.com/settings/tokens');
    process.exit(1);
  }

  log(`\n${colors.bold}🔄 Content Sync${colors.reset}`);
  log('─'.repeat(50));
  
  if (args.dryRun) {
    warn('DRY RUN - no files will be written\n');
  }

  const results: SyncResult[] = [];

  for (const source of sourcesToSync) {
    const sourceStartTime = Date.now();
    log(`\n${colors.cyan}📦 ${source.name}${colors.reset}`);
    log(`   ${colors.dim}Repository: ${source.connection.repository}${colors.reset}`);
    
    try {
      // Get retriever for this source type
      const retriever = getRetriever(source);
      
      // Filter topics if specified
      const topics = args.topic
        ? source.topics.filter(t => t.category.toLowerCase() === args.topic?.toLowerCase())
        : source.topics;

      if (topics.length === 0) {
        warn(`No matching topics for "${args.topic}"`);
        continue;
      }

      // Retrieve content for each topic
      const allContent: RawContent[] = [];
      
      for (const topic of topics) {
        log(`\n   ${colors.blue}📁 ${topic.category}${colors.reset}`);
        
        const result = await retriever.retrieve(source, topic);
        
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            warn(`   ${err}`);
          }
        }
        
        log(`      Retrieved: ${result.count} items (${formatDuration(result.duration)})`);
        allContent.push(...result.items);
        
        if (args.verbose && result.items.length > 0) {
          for (const item of result.items) {
            log(`      ${colors.dim}• ${item.title} (${item.slug})${colors.reset}`);
          }
        }
      }

      // Sync content to storage
      if (allContent.length > 0) {
        const syncResult = await storage.syncContent(allContent, args.dryRun);
        
        log(`\n   ${colors.bold}Sync Results:${colors.reset}`);
        if (syncResult.created.length > 0) {
          success(`   Created: ${syncResult.created.length}`);
          if (args.verbose) {
            for (const item of syncResult.created) {
              log(`      ${colors.dim}+ ${item.title}${colors.reset}`);
            }
          }
        }
        if (syncResult.updated.length > 0) {
          success(`   Updated: ${syncResult.updated.length}`);
          if (args.verbose) {
            for (const item of syncResult.updated) {
              log(`      ${colors.dim}~ ${item.title}${colors.reset}`);
            }
          }
        }
        if (syncResult.unchanged.length > 0) {
          info(`   Unchanged: ${syncResult.unchanged.length}`);
        }
        if (syncResult.errors.length > 0) {
          error(`   Errors: ${syncResult.errors.length}`);
          for (const item of syncResult.errors) {
            log(`      ${colors.red}! ${item.title}: ${item.error}${colors.reset}`);
          }
        }

        // Update sync state
        if (!args.dryRun) {
          const checksums: Record<string, string> = {};
          for (const content of allContent) {
            checksums[content.slug] = content.checksum;
          }
          
          await storage.updateSourceSyncState(source.name, {
            lastSync: new Date().toISOString(),
            checksums,
            lastSyncCount: allContent.length,
          });
        }

        results.push({
          source: source.name,
          success: syncResult.errors.length === 0,
          created: syncResult.created,
          updated: syncResult.updated,
          unchanged: syncResult.unchanged,
          errors: syncResult.errors,
          duration: Date.now() - sourceStartTime,
          syncedAt: new Date().toISOString(),
        });
      } else {
        info('   No content retrieved');
        results.push({
          source: source.name,
          success: true,
          created: [],
          updated: [],
          unchanged: [],
          errors: [],
          duration: Date.now() - sourceStartTime,
          syncedAt: new Date().toISOString(),
        });
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error(`   Sync failed: ${message}`);
      results.push({
        source: source.name,
        success: false,
        created: [],
        updated: [],
        unchanged: [],
        errors: [{ slug: '', title: '', category: '', status: 'error', error: message }],
        duration: Date.now() - sourceStartTime,
        syncedAt: new Date().toISOString(),
      });
    }
  }

  // Summary
  log('\n' + '─'.repeat(50));
  log(`${colors.bold}Summary${colors.reset}`);
  
  const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated.length, 0);
  const totalUnchanged = results.reduce((sum, r) => sum + r.unchanged.length, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const successfulSources = results.filter(r => r.success).length;

  log(`  Sources: ${successfulSources}/${results.length} successful`);
  log(`  Created: ${totalCreated}`);
  log(`  Updated: ${totalUpdated}`);
  log(`  Unchanged: ${totalUnchanged}`);
  if (totalErrors > 0) {
    log(`  ${colors.red}Errors: ${totalErrors}${colors.reset}`);
  }
  log(`  Duration: ${formatDuration(Date.now() - startTime)}`);

  if (args.dryRun) {
    log(`\n${colors.yellow}(Dry run - no changes were made)${colors.reset}`);
  }

  log('');
  
  // Exit with error if any source failed
  if (results.some(r => !r.success)) {
    process.exit(1);
  }
}

/**
 * CI-specific sync command for GitHub Actions
 * 
 * This command:
 * 1. Runs the content sync
 * 2. Configures git and stages changes
 * 3. Outputs GitHub Actions variables (has_changes, pr metadata)
 * 4. Writes a summary to GITHUB_STEP_SUMMARY
 */
async function ciSync(args: CliArgs): Promise<void> {
  const startTime = Date.now();
  const storage = new ContentStorage();
  
  // Determine sources to sync
  const sourcesToSync = args.source 
    ? [getSourceByName(args.source)].filter((s): s is SourceConfig => s !== undefined)
    : getEnabledSources();

  if (sourcesToSync.length === 0) {
    error('No sources to sync');
    if (args.source) {
      error(`Source "${args.source}" not found`);
      log(`\nAvailable sources: ${sources.map(s => s.name).join(', ')}`);
    }
    writeGitHubOutput('has_changes', 'false');
    process.exit(1);
  }

  // Check for GitHub token
  if (!hasToken()) {
    error('GitHub token not found');
    log('\nPlease set GITHUB_TOKEN or GH_TOKEN environment variable.');
    writeGitHubOutput('has_changes', 'false');
    process.exit(1);
  }

  log(`\n${colors.bold}🔄 Content Sync (CI Mode)${colors.reset}`);
  log('─'.repeat(50));
  
  if (args.dryRun) {
    warn('DRY RUN - no files will be written\n');
  }

  const results: SyncResult[] = [];

  // Run sync for each source
  for (const source of sourcesToSync) {
    const sourceStartTime = Date.now();
    log(`\n${colors.cyan}📦 ${source.name}${colors.reset}`);
    
    try {
      const retriever = getRetriever(source);
      
      const topics = args.topic
        ? source.topics.filter(t => t.category.toLowerCase() === args.topic?.toLowerCase())
        : source.topics;

      if (topics.length === 0) {
        warn(`No matching topics for "${args.topic}"`);
        continue;
      }

      const allContent: RawContent[] = [];
      
      for (const topic of topics) {
        log(`   ${colors.blue}📁 ${topic.category}${colors.reset}`);
        const result = await retriever.retrieve(source, topic);
        
        if (result.errors.length > 0) {
          for (const err of result.errors) {
            warn(`   ${err}`);
          }
        }
        
        log(`      Retrieved: ${result.count} items (${formatDuration(result.duration)})`);
        allContent.push(...result.items);
      }

      if (allContent.length > 0) {
        const syncResult = await storage.syncContent(allContent, args.dryRun);
        
        if (!args.dryRun) {
          const checksums: Record<string, string> = {};
          for (const content of allContent) {
            checksums[content.slug] = content.checksum;
          }
          
          await storage.updateSourceSyncState(source.name, {
            lastSync: new Date().toISOString(),
            checksums,
            lastSyncCount: allContent.length,
          });
        }

        results.push({
          source: source.name,
          success: syncResult.errors.length === 0,
          created: syncResult.created,
          updated: syncResult.updated,
          unchanged: syncResult.unchanged,
          errors: syncResult.errors,
          duration: Date.now() - sourceStartTime,
          syncedAt: new Date().toISOString(),
        });
        
        success(`   Sync complete: ${syncResult.created.length} created, ${syncResult.updated.length} updated`);
      } else {
        results.push({
          source: source.name,
          success: true,
          created: [],
          updated: [],
          unchanged: [],
          errors: [],
          duration: Date.now() - sourceStartTime,
          syncedAt: new Date().toISOString(),
        });
        info('   No content retrieved');
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      error(`   Sync failed: ${message}`);
      results.push({
        source: source.name,
        success: false,
        created: [],
        updated: [],
        unchanged: [],
        errors: [{ slug: '', title: '', category: '', status: 'error', error: message }],
        duration: Date.now() - sourceStartTime,
        syncedAt: new Date().toISOString(),
      });
    }
  }

  // Check for changes and handle git operations
  log('\n' + '─'.repeat(50));
  log(`${colors.bold}CI Operations${colors.reset}`);
  
  const contentHasChanges = !args.dryRun && hasChanges('content/');
  
  if (contentHasChanges) {
    success('Content changes detected');
    
    // Configure git and stage changes
    log('   Configuring git...');
    configureGit();
    
    log('   Staging content changes...');
    stageContent('content/');
    
    const changesSummary = getChangesSummary('content/');
    if (changesSummary) {
      log(`\n${colors.dim}${changesSummary}${colors.reset}`);
    }
  } else {
    info('No content changes detected');
  }
  
  // Generate CI context and PR metadata
  const context = getCIContext({ source: args.source, topic: args.topic });
  const prMetadata = generatePRMetadata(results, context);
  
  // Write GitHub Actions outputs
  log('\n' + '─'.repeat(50));
  log(`${colors.bold}GitHub Actions Outputs${colors.reset}`);
  
  writeGitHubOutput('has_changes', String(contentHasChanges));
  writeGitHubOutput('pr_title', prMetadata.title);
  writeGitHubOutput('pr_body', prMetadata.body);
  writeGitHubOutput('commit_message', prMetadata.commitMessage);
  writeGitHubOutput('pr_branch', prMetadata.branch);
  writeGitHubOutput('pr_labels', prMetadata.labels.join(','));
  
  success(`   has_changes: ${contentHasChanges}`);
  success(`   pr_branch: ${prMetadata.branch}`);
  
  // Write GitHub Actions summary
  const summary = generateSummary({
    dryRun: args.dryRun,
    hasChanges: contentHasChanges,
    source: args.source,
    topic: args.topic,
    trigger: context.trigger,
    results,
  });
  
  writeGitHubSummary(summary);
  success('   Summary written to GITHUB_STEP_SUMMARY');
  
  // Final summary
  log('\n' + '─'.repeat(50));
  const totalCreated = results.reduce((sum, r) => sum + r.created.length, 0);
  const totalUpdated = results.reduce((sum, r) => sum + r.updated.length, 0);
  const successfulSources = results.filter(r => r.success).length;
  
  log(`${colors.bold}Summary${colors.reset}`);
  log(`  Sources: ${successfulSources}/${results.length} successful`);
  log(`  Created: ${totalCreated}, Updated: ${totalUpdated}`);
  log(`  Duration: ${formatDuration(Date.now() - startTime)}`);
  log('');
  
  // Exit with error if any source failed
  if (results.some(r => !r.success)) {
    process.exit(1);
  }
}

async function show(args: CliArgs): Promise<void> {
  const [category, slug] = args.args;
  
  if (!category || !slug) {
    error('show command requires <category> and <slug> arguments');
    log('\nUsage: npx tsx pipeline/cli.ts show <category> <slug>');
    log('Example: npx tsx pipeline/cli.ts show people niccolo-machiavelli');
    process.exit(1);
  }

  const storage = new ContentStorage();
  const content = await storage.readContent(category, slug);

  if (!content) {
    error(`Content not found: ${category}/${slug}`);
    
    // List available slugs in category
    const slugs = await storage.listSlugs(category);
    if (slugs.length > 0) {
      log(`\nAvailable in "${category}":`);
      for (const s of slugs.slice(0, 10)) {
        log(`  • ${s}`);
      }
      if (slugs.length > 10) {
        log(`  ... and ${slugs.length - 10} more`);
      }
    } else {
      log(`\nNo content found in category "${category}"`);
      log('Run "sync" command first to retrieve content.');
    }
    process.exit(1);
  }

  log(`\n${colors.bold}${content.title}${colors.reset}`);
  log('─'.repeat(60));
  log(`${colors.dim}Source:${colors.reset}     ${content.source}`);
  log(`${colors.dim}Category:${colors.reset}   ${content.category}`);
  log(`${colors.dim}Slug:${colors.reset}       ${content.slug}`);
  log(`${colors.dim}Discussion:${colors.reset} #${content.discussionNumber}`);
  log(`${colors.dim}URL:${colors.reset}        ${content.discussionUrl}`);
  log(`${colors.dim}Updated:${colors.reset}    ${content.updatedAt}`);
  log(`${colors.dim}Retrieved:${colors.reset}  ${content.retrievedAt}`);
  log(`${colors.dim}Checksum:${colors.reset}   ${content.checksum.substring(0, 16)}...`);
  log('─'.repeat(60));
  log(`\n${colors.bold}Content:${colors.reset}\n`);
  log(content.body);
  log('');
}

async function listContent(args: CliArgs): Promise<void> {
  const [category] = args.args;
  const storage = new ContentStorage();

  if (category) {
    // List content in specific category
    const contents = await storage.listContent(category);
    
    if (contents.length === 0) {
      info(`No content in category "${category}"`);
      return;
    }

    log(`\n${colors.bold}${category}${colors.reset} (${contents.length} items)\n`);
    
    for (const content of contents) {
      log(`  ${colors.cyan}${content.slug}${colors.reset}`);
      log(`    ${content.title}`);
      if (args.verbose) {
        log(`    ${colors.dim}Updated: ${content.updatedAt}${colors.reset}`);
      }
    }
  } else {
    // List all categories
    const categories = ['people', 'organizations'];
    
    log(`\n${colors.bold}Content Overview${colors.reset}\n`);
    
    for (const cat of categories) {
      const contents = await storage.listContent(cat);
      log(`  ${colors.cyan}${cat}${colors.reset}: ${contents.length} items`);
    }
  }
  log('');
}

// =============================================================================
// Main Entry Point
// =============================================================================

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.help || !args.command) {
    showHelp();
    process.exit(args.help ? 0 : 1);
  }

  switch (args.command) {
    case 'sync':
      await sync(args);
      break;
    case 'ci-sync':
      await ciSync(args);
      break;
    case 'list-sources':
    case 'sources':
      listSources();
      break;
    case 'show':
      await show(args);
      break;
    case 'list':
    case 'ls':
      await listContent(args);
      break;
    default:
      error(`Unknown command: ${args.command}`);
      showHelp();
      process.exit(1);
  }
}

main().catch((err) => {
  error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
