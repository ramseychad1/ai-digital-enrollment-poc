import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class FormBuilderPage extends BasePage {
  // Step indicators
  readonly stepIndicators: Locator;
  readonly uploadPdfStep: Locator;
  readonly reviewSchemaStep: Locator;
  readonly configureStep: Locator;
  readonly publishStep: Locator;

  // Upload PDF step
  readonly uploadArea: Locator;
  readonly analyzeWithAiButton: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);

    // Step indicators
    this.stepIndicators = page.locator('[class*="step"]');
    this.uploadPdfStep = page.locator('text=Upload PDF');
    this.reviewSchemaStep = page.locator('text=Review Schema');
    this.configureStep = page.locator('text=Configure');
    this.publishStep = page.locator('text=Publish');

    // Upload PDF step elements
    this.uploadArea = page.locator('text=Click to upload PDF').locator('xpath=ancestor::*[contains(@class, "upload") or contains(@class, "drop")]').first();
    this.analyzeWithAiButton = page.locator('button', { hasText: 'Analyze with AI' });
    this.nextButton = page.locator('button', { hasText: 'Next' });
  }

  async goto(): Promise<void> {
    await this.page.goto('/admin/form-builder');
    await this.waitForPageLoad();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.page.locator('text=Upload Enrollment Form PDF')).toBeVisible();
    await expect(this.analyzeWithAiButton).toBeVisible();
  }

  async uploadPdf(filePath: string): Promise<void> {
    const fileInput = this.page.locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);
  }

  async clickAnalyzeWithAi(): Promise<void> {
    await this.analyzeWithAiButton.click();
  }

  async clickNext(): Promise<void> {
    await this.nextButton.click();
  }

  async getCurrentStep(): Promise<number> {
    // Find the active step (usually indicated by a different style)
    const activeStep = this.page.locator('[class*="active"], [class*="current"]').first();
    const stepText = await activeStep.textContent();
    if (stepText?.includes('Upload')) return 1;
    if (stepText?.includes('Review')) return 2;
    if (stepText?.includes('Configure')) return 3;
    if (stepText?.includes('Publish')) return 4;
    return 1;
  }
}
