# Content Retrieval System - Project Plan

**Project Start Date:** 2025-11-28  
**Status:** In Progress  
**Branch:** `connect-speculum-principum`

## Overview

Build a flexible content retrieval system that gathers content from external sources (starting with GitHub repositories) and stores it locally as JSON. This content serves as the foundation for generating static pages on the Veritas Civica SvelteKit site at build time.

The first integration target is `terrence-giggy/speculum-principum`, a knowledge graph repository with GitHub Discussions containing curated People and Organizations content.

## Goals

1. **Content Retrieval Integrations** - Modular TypeScript tools for fetching content from various sources
2. **Flexible Configuration** - TypeScript-based source definitions allowing multiple repositories
3. **Local Content Storage** - Raw content stored as JSON files with metadata
4. **CLI Workflow** - Node.js scripts for content sync operations
5. **Build Integration** - SvelteKit loads content at build time for static generation
6. **Unit Tests** - Vitest test coverage for all components

## Architecture

### Directory Structure

```
content/
├── raw/                        # Retrieved raw content (JSON)
│   ├── people/                 # People entities from discussions
│   │   └── {slug}.json         # Individual entity files
│   └── organizations/          # Organization entities
│       └── {slug}.json
└── .sync-state.json            # Sync metadata (last sync times, checksums)

scripts/
└── sync-content.ts             # CLI script for content sync

src/
├── lib/
│   ├── content/
│   │   ├── index.ts            # Content module exports
│   │   ├── config.ts           # Source configurations
│   │   ├── storage.ts          # Local JSON storage handler
│   │   ├── types.ts            # TypeScript types/interfaces
│   │   └── retrievers/
│   │       ├── index.ts        # Retriever factory
│   │       ├── base.ts         # Abstract base for retrievers
│   │       └── github-discussions.ts  # GitHub Discussions retriever
│   └── integrations/
│       └── github/
│           ├── index.ts
│           └── graphql.ts      # GitHub GraphQL API client
├── routes/
│   ├── people/
│   │   ├── +page.server.ts     # List all people (build-time)
│   │   └── [slug]/
│   │       └── +page.server.ts # Individual person page
│   └── organizations/
│       ├── +page.server.ts     # List all orgs
│       └── [slug]/
│           └── +page.server.ts # Individual org page

tests/
├── lib/
│   ├── content/
│   │   ├── config.test.ts
│   │   ├── storage.test.ts
│   │   └── retrievers/
│   │       └── github-discussions.test.ts
│   └── integrations/
│       └── github/
│           └── graphql.test.ts
```

### Content Source Configuration

```typescript
// src/lib/content/config.ts
export interface SourceConfig {
  name: string;
  type: 'github-discussions';
  enabled: boolean;
  connection: {
    repository: string;  // 'owner/repo' format
    // token from GITHUB_TOKEN env var
  };
  topics: TopicConfig[];
  sync: {
    incremental: boolean;  // Only fetch updated discussions
  };
}

export interface TopicConfig {
  category: string;       // 'People' or 'Organizations'
  outputPath: string;     // 'people/' or 'organizations/'
  slugFrom: 'title';      // Field to generate slug from
}

// First source configuration
export const speculumPrincipum: SourceConfig = {
  name: 'speculum-principum',
  type: 'github-discussions',
  enabled: true,
  connection: {
    repository: 'terrence-giggy/speculum-principum',
  },
  topics: [
    { category: 'People', outputPath: 'people/', slugFrom: 'title' },
    { category: 'Organizations', outputPath: 'organizations/', slugFrom: 'title' },
  ],
  sync: {
    incremental: true,
  },
};
```

### Raw Content Format

```typescript
// src/lib/content/types.ts
export interface RawContent {
  // Metadata
  source: string;              // 'speculum-principum'
  sourceType: string;          // 'github-discussions'
  category: string;            // 'People' or 'Organizations'
  title: string;               // 'Niccolo Machiavelli'
  slug: string;                // 'niccolo-machiavelli'
  discussionNumber: number;    // 42
  discussionUrl: string;       // Full GitHub URL
  retrievedAt: string;         // ISO timestamp
  updatedAt: string;           // From source, ISO timestamp
  checksum: string;            // Content hash for change detection
  
  // Content
  body: string;                // Markdown content from discussion
}
```

```json
// content/raw/people/niccolo-machiavelli.json
{
  "source": "speculum-principum",
  "sourceType": "github-discussions",
  "category": "People",
  "title": "Niccolo Machiavelli",
  "slug": "niccolo-machiavelli",
  "discussionNumber": 42,
  "discussionUrl": "https://github.com/terrence-giggy/speculum-principum/discussions/42",
  "retrievedAt": "2025-11-28T12:00:00Z",
  "updatedAt": "2025-11-28T10:30:00Z",
  "checksum": "abc123...",
  "body": "# Niccolo Machiavelli\n\n..."
}
```

## Implementation Phases

### Phase 1: Core Infrastructure

**Goal:** Establish TypeScript modules and directory structure.

**Tasks:**

1. [x] **Create content directory structure**
   - `content/raw/people/` and `content/raw/organizations/`
   - Add `.gitkeep` files and appropriate `.gitignore` rules
   - Create `content/.sync-state.json` template

2. [x] **Create TypeScript types and interfaces**
   - `src/lib/content/types.ts` - RawContent, SourceConfig, TopicConfig, SyncState
   - Export all types from `src/lib/content/index.ts`

3. [x] **Implement source configuration**
   - `src/lib/content/config.ts` - Source definitions as TypeScript objects
   - First source: speculum-principum with People and Organizations topics
   - Helper functions: `getEnabledSources()`, `getSourceByName()`

4. [x] **Add dev dependencies**
   - Add `tsx` for running TypeScript scripts directly
   - Add `vitest` for unit testing
   - Update `package.json` with new scripts

**Checkpoint:** `npm run sync:help` shows available commands ✅

---

### Phase 2: GitHub GraphQL Client

**Goal:** Create a lean GitHub GraphQL API client for discussions.

**Tasks:**

1. [x] **Create GitHub GraphQL client module**
   - `src/lib/integrations/github/graphql.ts`
   - Token resolution from environment (`GITHUB_TOKEN`, `GH_TOKEN`)
   - Generic GraphQL request handler using native `fetch()`
   - Error handling for auth errors, rate limits, not found

2. [x] **Implement discussion-specific queries**
   - `listDiscussionCategories(repo)` - Get all categories
   - `listDiscussions(repo, categoryId, limit)` - Paginated discussion list
   - `getDiscussion(repo, number)` - Single discussion with full body

3. [x] **Add response types**
   - `DiscussionCategory` - id, name, slug, description
   - `Discussion` - id, number, title, body, url, category, createdAt, updatedAt
   - Type guards for GraphQL response validation

4. [x] **Write unit tests**
   - `tests/lib/integrations/github/graphql.test.ts`
   - Mock fetch responses
   - Test error handling scenarios

**Checkpoint:** Can call `listDiscussions("terrence-giggy/speculum-principum", categoryId)` and get results ✅

---

### Phase 3: Content Retrieval Framework

**Goal:** Build the abstract retrieval framework and GitHub Discussions implementation.

**Tasks:**

1. [x] **Create abstract base retriever**
   - `src/lib/content/retrievers/base.ts`
   - `ContentRetriever` abstract class/interface with:
     - `retrieve(topicConfig): Promise<RawContent[]>`
     - `name: string` identifier

2. [x] **Implement GitHub Discussions retriever**
   - `src/lib/content/retrievers/github-discussions.ts`
   - Implements retriever for `github-discussions` source type
   - Maps discussion categories to topic configs
   - Converts discussion content to RawContent format
   - Generates URL-safe slugs from titles

3. [x] **Create retriever factory**
   - `src/lib/content/retrievers/index.ts`
   - `getRetriever(sourceConfig): ContentRetriever`
   - Map source types to retriever classes

4. [x] **Write unit tests**
   - Test retriever factory
   - Test GitHub Discussions retriever with mocked GraphQL client
   - Test slug generation edge cases

**Checkpoint:** Can retrieve discussions from speculum-principum via retriever interface ✅

---

### Phase 4: Local Storage Handler

**Goal:** Implement JSON file storage and sync state tracking.

**Tasks:**

1. [x] **Create storage module**
   - `src/lib/content/storage.ts`
   - `ContentStorage` class for file operations
   - `writeContent(content: RawContent)` - Write JSON file
   - `readContent(category, slug)` - Read existing content
   - `listContent(category)` - List all content in category
   - Generate checksums for change detection (using crypto)

2. [x] **Implement sync state management**
   - Track last sync time per source in `.sync-state.json`
   - Store content checksums for change detection
   - `getSyncState()`, `updateSyncState()` functions

3. [x] **Add content diffing**
   - Compare new content with existing by checksum
   - Return sync results: `{ created: [], updated: [], unchanged: [] }`

4. [x] **Write unit tests**
   - Test JSON file read/write
   - Test checksum generation
   - Test sync state persistence
   - Test content diffing logic

**Checkpoint:** Content files appear in `content/raw/` as JSON ✅

---

### Phase 5: Sync Script & CLI

**Goal:** Implement CLI script for content sync operations.

**Tasks:**

1. [x] **Create sync script**
   - `scripts/sync-content.ts`
   - Executable with `npx tsx scripts/sync-content.ts`
   - Commands: `sync`, `list-sources`, `show`

2. [x] **Implement `sync` command**
   - `--source NAME` - Sync specific source (default: all enabled)
   - `--topic TOPIC` - Sync specific topic (People, Organizations)
   - `--dry-run` - Preview without writing files
   - Output sync report (created, updated, unchanged counts)

3. [x] **Implement utility commands**
   - `list-sources` - Show configured sources and status
   - `show <category> <slug>` - Display retrieved content

4. [x] **Add npm scripts**
   - `npm run sync` - Run full sync
   - `npm run sync:dry` - Dry run
   - `npm run sync:help` - Show help

5. [x] **Write integration tests**
   - Test CLI argument parsing
   - Test sync output format
   - Test error handling

**Checkpoint:** Full sync workflow via `npm run sync` ✅

---

### Phase 6: SvelteKit Build Integration

**Goal:** Load synced content in SvelteKit routes at build time.

**Tasks:**

1. [x] **Create content loading utilities**
   - `src/lib/content/loader.ts`
   - `loadAllContent(category)` - Load all JSON files for a category
   - `loadContent(category, slug)` - Load single content file
   - Used in `+page.server.ts` files

2. [x] **Create people routes**
   - `src/routes/people/+page.server.ts` - List all people
   - `src/routes/people/+page.svelte` - People listing page
   - `src/routes/people/[slug]/+page.server.ts` - Load person data
   - `src/routes/people/[slug]/+page.svelte` - Person detail page

3. [x] **Create organizations routes**
   - Same structure as people routes
   - `src/routes/organizations/...`

4. [x] **Add prerender configuration**
   - Generate static pages for all synced content
   - Handle missing content gracefully (404)

5. [x] **Test build process**
   - Run `npm run build` with synced content
   - Verify static HTML generated for all entities

**Checkpoint:** Static pages generated for all synced content ✅

---

### Phase 7: GitHub Actions Workflow

**Goal:** Automate content retrieval via GitHub Actions.

**Tasks:**

1. [x] **Create sync workflow**
   - `.github/workflows/content-sync.yml`
   - Manual trigger (`workflow_dispatch`) with source/topic selection
   - Scheduled trigger (daily at 6:00 AM UTC)
   - Uses CONTENT_SYNC_TOKEN or GITHUB_TOKEN

2. [x] **Add content commit step**
   - Commit new/updated content files to repository
   - Skip if no changes (dry run shows no updates)
   - Configurable: commit directly with detailed message

3. [x] **Integrate with deploy workflow**
   - Option B: Sync commits, deploy triggers on push to main
   - Optional auto-trigger deploy (commented, ready to enable)

4. [x] **Test workflow**
   - Workflow syntax validated
   - Ready for manual trigger testing after merge
   - Summary step shows sync results

**Checkpoint:** Content sync can be triggered from GitHub Actions UI ✅

---

## Dependencies

### Dev Dependencies (package.json)

```json
{
  "devDependencies": {
    "tsx": "^4.7.0",
    "vitest": "^1.6.0"
  }
}
```

### NPM Scripts

```json
{
  "scripts": {
    "sync": "tsx scripts/sync-content.ts sync",
    "sync:dry": "tsx scripts/sync-content.ts sync --dry-run",
    "sync:help": "tsx scripts/sync-content.ts --help",
    "test:content": "vitest run tests/lib/content",
    "test:integrations": "vitest run tests/lib/integrations"
  }
}
```

### Environment Variables

- `GITHUB_TOKEN` or `GH_TOKEN` - GitHub personal access token with `repo` scope

### External APIs

- GitHub GraphQL API (`https://api.github.com/graphql`)

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| GitHub API rate limits | Sync fails mid-process | Implement pagination, incremental sync, rate limit handling |
| Discussion format changes | Content parsing breaks | Flexible parsing with fallbacks, store raw markdown |
| Large repositories | Long sync times | Incremental sync, category filtering |
| Token exposure | Security breach | Use env vars, never commit tokens |

---

## Success Metrics

- [ ] Can configure a new source in under 5 minutes
- [ ] Sync completes for 100+ discussions in under 60 seconds
- [ ] Zero data loss when re-syncing existing content
- [ ] Clear sync reports showing changes
- [ ] Vitest unit test coverage > 80%
- [ ] Static pages generated at build time from synced content

---

## Session Checkpoints

Use these to track progress across sessions:

| Session | Date | Phase | Completed Tasks |
|---------|------|-------|-----------------|
| 1 | 2025-11-28 | Setup | Project planning document created |
| 2 | 2025-11-28 | Phase 1 | Core Infrastructure complete: directory structure, TypeScript types, source config, dev dependencies (tsx, vitest), CLI scaffold |
| 3 | 2025-11-28 | Phase 2 | GitHub GraphQL Client complete: graphql.ts with token resolution, discussion queries, error handling, 29 unit tests passing |
| 4 | 2025-11-28 | Phase 3 | Content Retrieval Framework complete: base retriever interface, GitHub Discussions retriever, factory pattern, slug generation, 55 total tests |
| 5 | 2025-11-28 | Phase 4 | Local Storage Handler complete: ContentStorage class, sync state management, content diffing, 83 total tests |
| 6 | 2025-11-28 | Phase 5 | Sync Script & CLI complete: full sync workflow, colored output, dry-run support, list/show commands |
| 7 | 2025-11-28 | Phase 6 | SvelteKit Build Integration complete: loader.ts, /people and /organizations routes, detail pages with Article component, 106 tests |
| 8 | 2025-11-28 | Phase 7 | GitHub Actions Workflow complete: content-sync.yml with scheduled/manual triggers, auto-commit, deploy integration |

---

## Notes

- GitHub Discussions uses **GraphQL only** (no REST API for full content)
- The speculum-principum repository uses "People" and "Organizations" category names
- Discussion bodies contain markdown with structured entity information
- Keep the retrieval layer generic to support future sources (RSS, other APIs)
- JSON format chosen for native JavaScript/TypeScript compatibility
- SvelteKit static adapter prerenders all pages at build time
- Content sync is a separate operation from site building (can run independently)
- Use native `fetch()` (Node.js 18+) - no need for axios/node-fetch
