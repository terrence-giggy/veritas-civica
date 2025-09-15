# Development Workflow

This workflow provides specialized instructions for feature development and code implementation in the Veritas Civica project.

## When to Use This Workflow

Use this workflow when the user requests:
- New feature implementation
- Code refactoring or optimization
- Adding new pages or routes
- Integrating third-party libraries
- Performance improvements
- Code architecture changes

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
- Create reusable components in `src/lib/components/`
- Follow TypeScript best practices
- Use proper prop typing and validation
- Implement accessibility features

### State Management
- Use Svelte stores for global state
- Implement reactive patterns with Svelte 5 runes
- Handle async data properly

## Validation Requirements
- Build must complete without errors
- All TypeScript types must be properly defined
- Code must follow existing style patterns
- No console errors in browser