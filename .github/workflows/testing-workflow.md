# Testing Workflow

This workflow provides specialized instructions for test creation and debugging in the Veritas Civica project.

## When to Use This Workflow

Use this workflow when the user requests:
- Creating new tests
- Debugging failing tests
- Test strategy improvements
- End-to-end test scenarios
- Test coverage analysis
- Playwright configuration changes

## Testing Process

### Phase 1: Test Planning
1. Identify test scenarios and user flows
2. Determine appropriate test types (unit, integration, e2e)
3. Plan test data and setup requirements
4. Consider edge cases and error conditions

### Phase 2: Test Implementation
1. Write tests following Playwright patterns
2. Use proper selectors and assertions
3. Implement proper test cleanup
4. Add appropriate wait conditions

### Phase 3: Test Execution & Debugging
1. Run tests in different environments
2. Debug failing tests systematically
3. Verify test reliability and consistency
4. Update tests for code changes

## Key Testing Patterns

### Playwright Test Structure
```javascript
import { test, expect } from '@playwright/test';

test('homepage functionality', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();
});
```

### Test Setup
- Install browsers: `npx playwright install --with-deps`
- Run tests: `npm run test`
- Run with UI: `npm run test:ui`

## Validation Requirements
- All tests must pass consistently
- Tests must be maintainable and readable
- Proper error messages for failures
- Tests should run within reasonable time limits