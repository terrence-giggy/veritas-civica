# Content Retrieval System - Session Prompt

**Project:** Content Retrieval System for Veritas Civica  
**Plan Location:** `devops/projects/content-retrieval-system.md`
**Stack:** TypeScript, SvelteKit, Vitest

---

## Quick Start Prompt

Copy and paste this prompt to resume work on the content retrieval system:

```
I'm working on the Content Retrieval System feature for Veritas Civica. Please review the project plan at `devops/projects/content-retrieval-system.md` and:

1. Check the Session Checkpoints table to see completed work
2. Identify the current phase and next incomplete task
3. Implement the next task following the plan specifications

Key context:
- This is a SvelteKit static site using TypeScript
- Content is retrieved from GitHub repositories (first source: terrence-giggy/speculum-principum)
- Content comes from GitHub Discussions (People and Organizations categories)
- Raw content is stored as JSON files in `content/raw/`
- Sync CLI is TypeScript via `npx tsx scripts/sync-content.ts`
- SvelteKit loads content at build time for static page generation
- Tests use Vitest

Continue from where we left off, updating the Session Checkpoints table as you complete tasks.
```

---

## Phase-Specific Prompts

### Phase 1: Core Infrastructure

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 1 - Core Infrastructure

Tasks to implement:
1. Create content directory structure (content/raw/people/, content/raw/organizations/)
2. Create TypeScript types (src/lib/content/types.ts)
3. Implement source configuration (src/lib/content/config.ts)
4. Add dev dependencies (tsx, vitest) and npm scripts

Validation: `npm run sync:help` should show available commands.
```

### Phase 2: GitHub GraphQL Client

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 2 - GitHub GraphQL Client

Tasks to implement:
1. Create GitHub GraphQL client (src/lib/integrations/github/graphql.ts)
2. Implement discussion queries (listDiscussionCategories, listDiscussions, getDiscussion)
3. Add response types (DiscussionCategory, Discussion)
4. Write Vitest unit tests with mocked fetch responses

Use native fetch() API (Node.js 18+). Reference speculum-principum for GraphQL query patterns.
```

### Phase 3: Content Retrieval Framework

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 3 - Content Retrieval Framework

Tasks to implement:
1. Create abstract ContentRetriever base class/interface
2. Implement GitHubDiscussionsRetriever
3. Create retriever factory for source type mapping
4. Write Vitest unit tests

The retriever should convert GitHub Discussion content to RawContent objects ready for JSON storage.
```

### Phase 4: Local Storage Handler

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 4 - Local Storage Handler

Tasks to implement:
1. Create ContentStorage class for JSON file operations
2. Implement sync state management (.sync-state.json)
3. Add content diffing for change detection (using checksums)
4. Write Vitest unit tests

Use Node.js crypto for checksum generation. Store files as pretty-printed JSON.
```

### Phase 5: Sync Script & CLI

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 5 - Sync Script & CLI

Tasks to implement:
1. Create scripts/sync-content.ts with command parsing
2. Implement sync command (--source, --topic, --dry-run flags)
3. Implement list-sources and show commands
4. Add npm scripts (sync, sync:dry, sync:help)
5. Write integration tests

Use process.argv for argument parsing or a lightweight CLI library.
```

### Phase 6: SvelteKit Build Integration

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 6 - SvelteKit Build Integration

Tasks to implement:
1. Create content loader utilities (src/lib/content/loader.ts)
2. Create people routes with +page.server.ts for data loading
3. Create organizations routes (same pattern)
4. Configure prerendering for all content pages
5. Test build process generates static HTML

SvelteKit static adapter will prerender all pages at build time.
```

### Phase 7: GitHub Actions Workflow

```
Continue the Content Retrieval System project (see `devops/projects/content-retrieval-system.md`).

Current phase: Phase 7 - GitHub Actions Workflow

Tasks to implement:
1. Create .github/workflows/content-sync.yaml workflow
2. Add manual trigger with source selection input
3. Configure content commit step (or PR creation)
4. Integrate with existing deploy workflow

The workflow should use GITHUB_TOKEN secret for API access.
```

---

## Debugging Prompts

### API Issues

```
I'm having issues with the GitHub GraphQL API in the Content Retrieval System.

Error: [paste error message]

Please help debug. The relevant files are:
- src/lib/integrations/github/graphql.ts
- src/lib/content/retrievers/github-discussions.ts

Reference the working implementation in terrence-giggy/speculum-principum for patterns.
```

### Storage Issues

```
I'm having issues with content storage in the Content Retrieval System.

Error: [paste error message]

Please help debug. The relevant files are:
- src/lib/content/storage.ts
- content/raw/ directory structure

Expected behavior: JSON files should be created for each discussion.
```

### Test Failures

```
Tests are failing in the Content Retrieval System.

Failed test: [paste test name and error]

Please help fix. Run tests with: npm run test:content

The project plan is at devops/projects/content-retrieval-system.md
```

### Build Issues

```
SvelteKit build is failing with content loading.

Error: [paste error message]

Please help debug. The relevant files are:
- src/lib/content/loader.ts
- src/routes/people/+page.server.ts
- content/raw/people/*.json

Run build with: npm run build
```

---

## Reference Information

### Target Repository Structure (speculum-principum)

The source repository uses:
- GitHub Discussions with categories: "People", "Organizations"
- Discussion titles = Entity names (e.g., "Niccolo Machiavelli")
- Discussion bodies = Markdown-formatted entity profiles with:
  - Summary section
  - Attributes
  - Associations with other entities
  - Related concepts
  - Source references

### Expected Output Format

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

### Key Environment Variables

```bash
export GITHUB_TOKEN="ghp_your_token_here"
# or
export GH_TOKEN="ghp_your_token_here"
```

### NPM Scripts

```bash
npm run sync          # Full sync of all enabled sources
npm run sync:dry      # Preview sync without writing files
npm run sync:help     # Show CLI help
npm run test:content  # Run content module tests
npm run build         # Build static site (loads synced content)
```

---

## Extending the System

### Adding a New Source Type

```
I want to add a new content source type to the Content Retrieval System.

Source type: [RSS feed / REST API / etc.]
Source details: [describe the source]

Please:
1. Create a new retriever in src/lib/content/retrievers/
2. Register it in the retriever factory (src/lib/content/retrievers/index.ts)
3. Add the source type to SourceConfig type
4. Add Vitest unit tests

Follow the patterns established by GitHubDiscussionsRetriever.
```

### Adding a New Source Repository

```
I want to add a new GitHub repository as a content source.

Repository: [owner/repo]
Discussion categories to sync: [list categories]

Please:
1. Add new source config in src/lib/content/config.ts
2. Test the sync with npm run sync --source <name>
3. Verify content is stored correctly in content/raw/

Use speculumPrincipum config as a template.
```
