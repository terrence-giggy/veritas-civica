# Content Integration Project Plan

**Project:** Connect Raw Content to Svelte Pages  
**Created:** 2024-12-04  
**Status:** ✅ Complete  
**Branch:** connect-speculum-principum

---

## Overview

This project connects the raw content retrieved from external sources (GitHub Discussions) to the Svelte page templates. The content pipeline successfully syncs 29 person records to `content/raw/people/`, and we now need to enhance the rendering to properly display this structured data.

---

## Current State Analysis

### ✅ What's Working
- Content sync pipeline (`npm run sync`) pulls from GitHub Discussions
- 29 person JSON files stored in `content/raw/people/`
- Content loader (`src/lib/content/loader.ts`) reads JSON files at build time
- Listing pages render cards with title, excerpt, source, and updatedAt
- Detail pages render basic article layout with rudimentary markdown splitting
- Static site generation produces HTML for all people

### ⚠️ Gaps Identified
| Gap | Impact | Priority |
|-----|--------|----------|
| ~~**Navigation 404s**~~ | ~~Links to /people and /organizations broken (missing base path)~~ | ~~**Critical**~~ ✅ Fixed |
| ~~**Landing page placeholders**~~ | ~~Featured Stories show fake content, not real data~~ | ~~**Critical**~~ ✅ Fixed |
| ~~**Hero buttons non-functional**~~ | ~~"Start Reading" and "Write Your Story" buttons do nothing~~ | ~~High~~ ✅ Fixed |
| Basic markdown parsing | Tables, blockquotes, links not rendered | High |
| Attribute extraction | Structured data in markdown not displayed | Medium |
| Organizations content | Directory is empty | Low |
| Search functionality | Not implemented | Low |
| Filtering/sorting | No category or attribute filters | Low |

---

## Phases

### Phase 0: Fix Navigation & Landing Page ✅ COMPLETE
**Goal:** Fix broken navigation links and replace placeholder content with real data

#### Tasks
- [x] **0.1** Add SvelteKit base path support to Navigation.svelte (import `{base}` from `$app/paths`)
- [x] **0.2** Update all navigation links to use `{base}/people`, `{base}/organizations`
- [x] **0.3** Update landing page hero buttons to link to real destinations
- [x] **0.4** Create `+page.server.ts` for landing page to load featured content
- [x] **0.5** Replace placeholder "Featured Stories" cards with real people data
- [x] **0.6** Update people/org listing pages to use base path in links
- [x] **0.7** Update detail pages to use base path in breadcrumb/back links
- [x] **0.8** Test navigation flow: Home → People → Person Detail → Back
- [x] **0.9** Verify build and preview work correctly

#### Files Modified
| File | Changes |
|------|---------|
| `src/lib/components/ui/Navigation.svelte` | ✅ Added `{base}` import, updated hrefs |
| `src/routes/+page.svelte` | ✅ Replaced placeholder cards with data prop, added base path |
| `src/routes/+page.server.ts` | ✅ **Created** - Loads featured people for landing page |
| `src/routes/people/+page.svelte` | ✅ Added base path in card links |
| `src/routes/people/[slug]/+page.svelte` | ✅ Added base path in breadcrumb |
| `src/routes/organizations/+page.svelte` | ✅ Added base path in card links |
| `src/routes/organizations/[slug]/+page.svelte` | ✅ Added base path in breadcrumb |

### Phase 1: Enhanced Markdown Rendering ✅ COMPLETE
**Goal:** Render all markdown elements correctly in detail pages

#### Tasks
- [x] **1.1** Research markdown parsing options (marked, remark, mdsvex) → Selected `marked`
- [x] **1.2** Create markdown utility module (`src/lib/utils/markdown.ts`)
- [x] **1.3** Implement markdown-to-HTML conversion with sanitization
- [x] **1.4** Update `src/routes/people/[slug]/+page.svelte` to use parser
- [x] **1.5** Update `src/routes/organizations/[slug]/+page.svelte` to use parser
- [x] **1.6** Style markdown elements (tables, blockquotes, code, lists) in `src/app.css`
- [x] **1.7** Test with existing content files
- [x] **1.8** Verify build succeeds and pages render correctly

#### Files Modified
| File | Changes |
|------|---------|
| `src/lib/utils/markdown.ts` | ✅ **Created** - Markdown to HTML utility using `marked` |
| `src/app.css` | ✅ Added prose styles for tables, blockquotes, code, lists, links, hr |
| `src/routes/people/[slug]/+page.svelte` | ✅ Replaced manual parsing with markdown renderer |
| `src/routes/organizations/[slug]/+page.svelte` | ✅ Replaced manual parsing with markdown renderer |

### Phase 2: Structured Attribute Display ✅ COMPLETE
**Goal:** Extract and display structured attributes from content body

#### Tasks
- [x] **2.1** Analyze attribute table format in raw content
- [x] **2.2** Create attribute parser to extract key-value pairs (`src/lib/utils/attributes.ts`)
- [x] **2.3** Extend `ContentDetail` type with parsed attributes
- [x] **2.4** Update loader to parse and include attributes
- [x] **2.5** Design attribute display component (`AttributeDisplay.svelte`)
- [x] **2.6** Integrate attribute display into detail pages
- [x] **2.7** Add confidence score display (from body header)
- [x] **2.8** Test attribute extraction with various content files

#### Files Modified
| File | Changes |
|------|---------|
| `src/lib/utils/attributes.ts` | ✅ **Created** - Parses Type, Confidence, and attribute table |
| `src/lib/components/ui/AttributeDisplay.svelte` | ✅ **Created** - Displays attributes with badges |
| `src/lib/content/loader.ts` | ✅ Extended types, added attribute parsing |
| `src/routes/people/[slug]/+page.svelte` | ✅ Added AttributeDisplay component |
| `src/routes/organizations/[slug]/+page.svelte` | ✅ Added AttributeDisplay component |
| `src/routes/people/+page.svelte` | ✅ Added role badge and confidence % to cards |
| `src/routes/organizations/+page.svelte` | ✅ Added role badge and confidence % to cards |

### Phase 3: Enhanced Listing Pages ✅ COMPLETE (merged with Phase 2)
**Goal:** Improve content discovery with richer card displays

#### Tasks
- [x] **3.1** Extract additional metadata for listings (role, confidence)
- [x] **3.2** Update card component to display extracted metadata
- [x] **3.3** Add role badges to listing cards
- [x] **3.4** Add confidence percentage badges to cards
- [x] **3.5** Verify responsive layout works with enhanced cards

### Phase 4: Organizations Content ✅ COMPLETE
**Goal:** Populate and render organization content

#### Tasks
- [x] **4.1** Verify organization sync is configured in content pipeline
- [x] **4.2** Trigger sync to populate `content/raw/organizations/`
- [x] **4.3** Test organization listing and detail pages
- [x] **4.4** Handle any schema differences from people content

#### Results
- ✅ Sync configuration verified - Organizations category is properly configured
- ✅ Sync tested with GitHub token - **0 organizations exist in source** (knowledge graph has not added organization entities yet)
- ✅ Empty state displays correctly on organizations listing page
- ✅ Organization detail page template ready (mirrors people structure)
- ✅ Build succeeds with empty organizations directory

**Note:** The source repository (speculum-principum) currently has no Organization discussions. When organizations are added to the knowledge graph and synced, they will automatically appear on the site using the same infrastructure as People.

---

## Technical Decisions

### Markdown Parser Selection
**Decision Needed:** Choose between:
1. **marked** - Fast, widely used, simple API
2. **remark/unified** - Plugin ecosystem, AST-based, more control
3. **mdsvex** - Svelte-native, but primarily for `.svx` files

**Recommendation:** Use `marked` for simplicity unless complex transformations needed.

### Attribute Extraction Strategy
**Decision Needed:** Where to parse attributes?
1. **At sync time** - Add to RawContent schema, parse when retrieving
2. **At build time** - Parse in loader.ts when loading for pages
3. **At render time** - Parse in Svelte component

**Recommendation:** Parse at build time in loader.ts to keep components simple.

---

## Files to Modify

### Phase 0 Files (Critical)
| File | Changes |
|------|---------|
| `src/lib/components/ui/Navigation.svelte` | Add `{base}` import, update hrefs |
| `src/routes/+page.svelte` | Replace placeholder cards with data prop |
| `src/routes/+page.server.ts` | **New** - Load featured people for landing page |
| `src/routes/people/+page.svelte` | Use base path in card links |
| `src/routes/people/[slug]/+page.svelte` | Use base path in breadcrumb |
| `src/routes/organizations/+page.svelte` | Use base path in card links |
| `src/routes/organizations/[slug]/+page.svelte` | Use base path in breadcrumb |

### Phase 1 Files
| File | Changes |
|------|---------|
| `src/lib/utils/markdown.ts` | **New** - Markdown parsing utility |
| `src/routes/people/[slug]/+page.svelte` | Replace basic splitting with parser |
| `src/routes/organizations/[slug]/+page.svelte` | Replace basic splitting with parser |
| `src/app.css` | Add markdown element styles |

### Phase 2 Files
| File | Changes |
|------|---------|
| `src/lib/content/loader.ts` | Add attribute parsing to ContentDetail |
| `src/lib/content/types.ts` | Extend types with parsed attributes |
| `src/lib/components/ui/AttributeDisplay.svelte` | **New** - Attribute rendering |
| `src/routes/people/[slug]/+page.svelte` | Integrate attribute display |

### Phase 3 Files
| File | Changes |
|------|---------|
| `src/lib/content/loader.ts` | Add metadata extraction to ContentSummary |
| `src/routes/people/+page.svelte` | Enhanced card display |
| `src/routes/organizations/+page.svelte` | Enhanced card display |

---

## Validation Checklist

After each phase, verify:
- [ ] `npm run build` completes without errors
- [ ] `npm run preview` shows pages correctly
- [ ] All 29 people render with new features
- [ ] Dark mode displays correctly
- [ ] Mobile responsive layout works
- [ ] No console errors in browser

---

## Session Log

### Session 1 - 2024-12-04
- [x] Research current project structure
- [x] Analyze raw content schema
- [x] Review Svelte page placeholders
- [x] Identify gaps between content and pages
- [x] Create this project plan
- [x] Identified critical navigation 404 issue (missing base path)
- [x] Identified placeholder content on landing page
- [x] **Completed Phase 0: Fixed navigation & landing page**
  - Added `{base}` path support to all navigation links
  - Created `+page.server.ts` to load featured people
  - Replaced placeholder cards with real content
  - Updated hero buttons to functional links
  - Verified build and preview work correctly
- [x] **Completed Phase 1: Enhanced markdown rendering**
  - Created `src/lib/utils/markdown.ts` using `marked` library
  - Added comprehensive prose CSS for tables, blockquotes, code, lists, links
  - Updated people and organizations detail pages to use markdown renderer
  - Tables now render properly with styled headers and hover effects
  - Blockquotes styled with green left border for source mentions
  - Build and preview verified working
- [x] **Completed Phase 2 & 3: Structured attribute display & enhanced listings**
  - Created `src/lib/utils/attributes.ts` to parse Type, Confidence, and attributes table
  - Created `AttributeDisplay.svelte` component with badges and attribute list
  - Extended `ContentDetail` and `ContentSummary` types with parsed data
  - Updated detail pages with AttributeDisplay showing type badge, confidence %, and attributes
  - Updated listing page cards with role badges and confidence percentage indicators
  - Color-coded confidence: green (90%+), yellow (70-89%), red (<70%)
  - Build and preview verified working
- [x] **Completed Phase 4: Organizations content**
  - Verified sync configuration is correct for Organizations category
  - Tested sync with GitHub token (GH_TOKEN from .env)
  - Confirmed source has 0 organizations (knowledge graph hasn't added them yet)
  - Organizations page shows appropriate empty state
  - Infrastructure is ready - organizations will appear automatically when added to source

---

## 🎉 PROJECT COMPLETE

All phases of the Content Integration project have been completed:

| Phase | Status | Summary |
|-------|--------|---------|
| Phase 0 | ✅ | Fixed navigation 404s and landing page placeholders |
| Phase 1 | ✅ | Enhanced markdown rendering with tables, blockquotes, etc. |
| Phase 2 | ✅ | Structured attribute display with badges and lists |
| Phase 3 | ✅ | Enhanced listing pages with role and confidence badges |
| Phase 4 | ✅ | Organizations infrastructure ready (awaiting source content) |

---

## Notes

- Raw content uses a specific markdown structure with `## Summary`, `## Attributes`, `## Source Mentions` sections
- Attributes are stored as markdown tables, need parsing
- Confidence percentages appear in body header as `**Confidence:** XX%`
- Source documents section contains hash references
- Some entries have minimal data (e.g., `william-fowler.json` has only role and context)
