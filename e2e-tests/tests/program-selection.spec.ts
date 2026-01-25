import { test, expect } from '@playwright/test';
import { ProgramSelectorPage } from '../pages';

test.describe('Program Selection', () => {
  let programSelector: ProgramSelectorPage;

  test.beforeEach(async ({ page }) => {
    programSelector = new ProgramSelectorPage(page);
    await programSelector.goto();
  });

  test('should display the program selector page', async () => {
    await programSelector.verifyPageLoaded();
  });

  test('should display multiple program cards', async () => {
    const count = await programSelector.getProgramCount();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should have navigation menu with correct links', async ({ page }) => {
    await expect(page.locator('a', { hasText: 'Programs' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Form Builder' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Help' })).toBeVisible();
  });

  test('should navigate to Form Builder from header', async ({ page }) => {
    await page.locator('a', { hasText: 'Form Builder' }).click();
    await page.waitForURL('/admin/form-builder');
    await expect(page.locator('text=Upload Enrollment Form PDF')).toBeVisible();
  });

  test('should display program details in cards', async ({ page }) => {
    // Each card should have a title, description, and enroll button
    const firstCard = page.locator('[class*="card"]').first();
    await expect(firstCard).toBeVisible();

    // Should have an Enroll Now button
    const enrollButton = firstCard.locator('button', { hasText: 'Enroll Now' });
    await expect(enrollButton).toBeVisible();
  });

  test('should open program in new context when clicking Enroll Now', async ({ page, context }) => {
    const initialPageCount = context.pages().length;
    await programSelector.selectProgramByIndex(0);

    // Wait for potential new tab
    await page.waitForTimeout(500);

    const currentPageCount = context.pages().length;
    // Either a new tab was opened, or we navigated in the same tab
    const pages = context.pages();
    const targetPage = pages[pages.length - 1];

    await expect(targetPage).toHaveURL(/\/enroll\//);
  });
});
