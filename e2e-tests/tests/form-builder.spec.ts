import { test, expect } from '@playwright/test';
import { FormBuilderPage } from '../pages';

test.describe('Form Builder', () => {
  let formBuilder: FormBuilderPage;

  test.beforeEach(async ({ page }) => {
    formBuilder = new FormBuilderPage(page);
    await formBuilder.goto();
  });

  test('should display the form builder page with 4-step wizard', async ({ page }) => {
    await formBuilder.verifyPageLoaded();

    // Verify all steps are visible (using first() to handle multiple matches)
    await expect(page.getByText('Upload PDF', { exact: true })).toBeVisible();
    await expect(page.getByText('Review Schema')).toBeVisible();
    await expect(page.getByText('Configure')).toBeVisible();
    await expect(page.getByText('Publish')).toBeVisible();
  });

  test('should display upload area on step 1', async ({ page }) => {
    await expect(page.locator('text=Upload Enrollment Form PDF')).toBeVisible();
    await expect(page.locator('text=Click to upload PDF')).toBeVisible();
  });

  test('should have Analyze with AI button', async () => {
    await expect(formBuilder.analyzeWithAiButton).toBeVisible();
  });

  test('should have Next button', async () => {
    await expect(formBuilder.nextButton).toBeVisible();
  });

  test('should navigate back to programs from header', async ({ page }) => {
    await page.locator('a', { hasText: 'Programs' }).click();
    await page.waitForURL('/');
    await expect(page.locator('text=AI Digital Enrollment')).toBeVisible();
  });

  // Test for PDF upload would require a test PDF file
  test.skip('should upload a PDF file', async ({ page }) => {
    // This test requires a test PDF file to be available
    const testPdfPath = './fixtures/test-enrollment-form.pdf';
    await formBuilder.uploadPdf(testPdfPath);
    // Verify upload succeeded
  });
});
