// @ts-check
import { test, expect } from '@playwright/test';

test('homepage has title and main content', async ({ page }) => {
  await page.goto('/');

  // Expect a title containing "Veritas Civica"
  await expect(page).toHaveTitle(/Veritas Civica/);
  
  // Check for main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();
  
  // Check for description text about historical figures
  await expect(page.getByText('Exploring historical figures and organizations through the lens of classical political philosophy.')).toBeVisible();
});

test('navigation buttons are present', async ({ page }) => {
  await page.goto('/');

  // Check for navigation buttons (rendered as buttons with href attributes)
  const explorePeopleButton = page.getByRole('button', { name: 'Explore People' });
  const viewOrganizationsButton = page.getByRole('button', { name: 'View Organizations' });
  
  await expect(explorePeopleButton).toBeVisible();
  await expect(viewOrganizationsButton).toBeVisible();
});

test('sections and content are displayed correctly', async ({ page }) => {
  await page.goto('/');
  
  // Check for page title
  await expect(page).toHaveTitle(/Veritas Civica/);

  // Check for main heading
  await expect(page.getByRole('heading', { name: 'Welcome to Veritas Civica' })).toBeVisible();

  // Check for Featured People section
  await expect(page.getByRole('heading', { name: 'Featured People' })).toBeVisible();

  // Check for Design System Showcase section
  await expect(page.getByRole('heading', { name: 'Design System Showcase' })).toBeVisible();

  // Check for Design Components section
  await expect(page.getByRole('heading', { name: 'Design Components' })).toBeVisible();

  // Check that navigation buttons are present
  await expect(page.getByRole('button', { name: 'Explore People' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Organizations' })).toBeVisible();
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
