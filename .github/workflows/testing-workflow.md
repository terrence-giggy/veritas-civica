# Testing Workflow

This workflow provides specialized instructions for test creation and debugging in the Veritas Civica Medium.com-inspired publishing platform.

## When to Use This Workflow

Use this workflow when the user requests:
- Creating tests for typography and reading experience features
- Testing dark mode and theme toggle functionality
- Debugging failing tests related to content presentation
- Test strategy improvements for publishing platform features
- End-to-end test scenarios for content consumption
- Playwright configuration changes for Medium.com-inspired UI testing

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

### Playwright Test Structure for Publishing Platform
```javascript
import { test, expect } from '@playwright/test';

test('Medium.com-inspired homepage functionality', async ({ page }) => {
  await page.goto('/');
  
  // Test typography hierarchy
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();
  
  // Test Medium-inspired buttons
  await expect(page.getByRole('button', { name: 'Start Reading' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Write Your Story' })).toBeVisible();
  
  // Test article cards
  await expect(page.getByText('Featured Stories')).toBeVisible();
  await expect(page.getByText('The Future of Typography')).toBeVisible();
});

test('Dark mode functionality', async ({ page }) => {
  await page.goto('/');
  
  // Find and click theme toggle
  const themeToggle = page.locator('[data-testid="theme-toggle"]');
  await themeToggle.click();
  
  // Verify dark mode is applied
  await expect(page.locator('html')).toHaveClass(/dark/);
  
  // Test toggle back to light mode
  await themeToggle.click();
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});
```

### Test Setup
- Install browsers: `npx playwright install --with-deps`
- Run tests: `npm run test`
- Run with UI: `npm run test:ui`

## Validation Requirements
- All tests must pass consistently, including dark mode tests
- Typography and reading experience tests must validate proper font rendering
- Theme toggle tests must verify seamless light/dark mode transitions
- Tests must be maintainable and reflect Medium.com-inspired content structure
- Proper error messages for failures
- Tests should run within reasonable time limits