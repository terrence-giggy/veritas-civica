// @ts-check
import { test, expect } from '@playwright/test';

test('homepage has title and main content', async ({ page }) => {
  await page.goto('/');

  // Expect a title containing "Veritas Civica"
  await expect(page).toHaveTitle(/Veritas Civica/);
  
  // Check for main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();
  
  // Check for updated description text
  await expect(page.getByText('A modern, typography-focused publishing platform inspired by the best reading experiences on the web')).toBeVisible();
});

test('navigation buttons are present and clickable', async ({ page }) => {
  await page.goto('/');

  // Check for updated button text
  const startReadingButton = page.getByRole('button', { name: 'Start Reading' });
  const writeStoryButton = page.getByRole('button', { name: 'Write Your Story' });
  
  await expect(startReadingButton).toBeVisible();
  await expect(writeStoryButton).toBeVisible();
  
  // Test that buttons are clickable (they should not throw errors)
  await startReadingButton.click();
  await writeStoryButton.click();
});

test('cards and content are displayed correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check for page title
  await expect(page).toHaveTitle(/Veritas Civica/);

  // Check for main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();

  // Check for Featured Stories section
  await expect(page.getByRole('heading', { name: 'Featured Stories' })).toBeVisible();

  // Check for specific article cards
  await expect(page.getByText('The Future of Typography in Digital Publishing')).toBeVisible();
  await expect(page.getByText('Building Accessible Web Components')).toBeVisible();
  await expect(page.getByText('The Art of Minimalist Design')).toBeVisible();

  // Check for Design System Showcase section
  await expect(page.getByRole('heading', { name: 'Design System Showcase' })).toBeVisible();

  // Check that buttons are present
  await expect(page.getByRole('button', { name: 'Start Reading' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Write Your Story' })).toBeVisible();
});

test('dark mode toggle works', async ({ page }) => {
  await page.goto('/');
  
  // Find the theme toggle button (should be a sun icon initially)
  const themeToggle = page.locator('button[aria-label*="Switch to dark mode"]');
  await expect(themeToggle).toBeVisible();
  
  // Click to switch to dark mode
  await themeToggle.click();
  
  // Check that the document now has the dark class
  await expect(page.locator('html')).toHaveClass(/dark/);
  
  // Check that the toggle now shows moon icon (dark mode active)
  const darkModeToggle = page.locator('button[aria-label*="Switch to light mode"]');
  await expect(darkModeToggle).toBeVisible();
  
  // Click again to switch back to light mode
  await darkModeToggle.click();
  
  // Check that dark class is removed
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});
