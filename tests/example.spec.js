// @ts-check
import { test, expect } from '@playwright/test';

test('homepage has title and main content', async ({ page }) => {
  await page.goto('/');

  // Expect a title containing "Veritas Civica"
  await expect(page).toHaveTitle(/Veritas Civica/);
  
  // Check for main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();
  
  // Check for description text
  await expect(page.getByText('A modern Svelte-based static website with Shadcn Svelte components')).toBeVisible();
});

test('navigation buttons are present and clickable', async ({ page }) => {
  await page.goto('/');

  // Check for buttons
  const getStartedButton = page.getByRole('button', { name: 'Get Started' });
  const learnMoreButton = page.getByRole('button', { name: 'Learn More' });
  
  await expect(getStartedButton).toBeVisible();
  await expect(learnMoreButton).toBeVisible();
  
  // Test that buttons are clickable (they should not throw errors)
  await getStartedButton.click();
  await learnMoreButton.click();
});

test('cards are displayed', async ({ page }) => {
  await page.goto('/');
  
  // Check for page title
  await expect(page).toHaveTitle(/Veritas Civica/);

  // Check for main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();

  // Check that the main features grid is present (the first grid with 3 cards)
  await expect(page.locator('.grid.gap-6.md\\:grid-cols-2.lg\\:grid-cols-3')).toBeVisible();

  // Check for specific cards
  await expect(page.getByText('Modern Design')).toBeVisible();
  await expect(page.getByText('Component Library')).toBeVisible();
  await expect(page.getByText('Static Performance')).toBeVisible();

  // Check that buttons are present
  await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Learn More' })).toBeVisible();
});
