# Development Workflow

This workflow provides specialized instructions for feature development and code implementation in the Veritas Civica Medium.com-inspired publishing platform.

## When to Use This Workflow

Use this workflow when the user requests:
- New publishing platform features
- Typography and reading experience enhancements
- Theme management and dark mode functionality
- Content presentation improvements
- Article and long-form content features
- Performance improvements for content-heavy applications
- Code architecture changes for publishing platforms

## Development Process

### Phase 1: Planning & Analysis
1. Understand requirements and scope
2. Analyze existing codebase structure
3. Plan implementation approach
4. Identify potential impacts on existing code

### Phase 2: Implementation
1. Create or modify necessary files
2. Follow SvelteKit and TypeScript best practices
3. Maintain consistency with existing patterns
4. Implement proper error handling

### Phase 3: Testing & Validation
1. Run build process to ensure no compilation errors
2. Test functionality in development environment
3. Verify no regressions in existing features
4. Run automated tests if applicable

## Key Technical Patterns

### SvelteKit Routing
- File-based routing in `src/routes/`
- Use `+page.svelte` for pages
- Use `+layout.svelte` for shared layouts
- Use `+page.server.js` for server-side logic

### Component Development
- Create content-focused components in `src/lib/components/ui/`
- Follow Typography and Article component patterns for readability
- Implement theme-aware components using CSS custom properties
- Use proper prop typing and validation with Svelte 5 runes
- Implement accessibility features for content consumption

### State Management & Theming
- Use Svelte stores for global theme state
- Implement CSS custom properties for robust dark mode support
- Handle theme transitions with localStorage persistence
- Use Svelte 5 runes for reactive theme management

## Validation Requirements
- Build must complete without errors
- Typography hierarchy must render correctly with serif fonts
- Dark mode toggle must work seamlessly
- All TypeScript types must be properly defined
- Code must follow Medium.com-inspired design patterns
- Reading experience must be optimized (line heights, character limits)
- No console errors in browser