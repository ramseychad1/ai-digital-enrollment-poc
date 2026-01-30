import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login');

  // Fill in login form
  await page.locator('input[placeholder="Enter your username"]').fill('demo');
  await page.locator('input[placeholder="Enter your password"]').fill('demo123');

  // Click login button
  await page.locator('button', { hasText: 'Log In' }).click();

  // Wait for successful login (redirect to programs page or form builder)
  await page.waitForURL(/\/(admin\/form-builder|$)/);

  // Verify we're authenticated by checking we're not on login page
  await expect(page).not.toHaveURL(/\/login/);

  // Save authenticated state
  await page.context().storageState({ path: authFile });
});
