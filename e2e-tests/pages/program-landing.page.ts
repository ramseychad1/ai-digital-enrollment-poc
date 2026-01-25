import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProgramLandingPage extends BasePage {
  // Locators
  readonly aboutSection: Locator;
  readonly startEnrollmentButton: Locator;
  readonly backToProgramsButton: Locator;

  constructor(page: Page) {
    super(page);
    this.aboutSection = page.locator('h2, h3', { hasText: 'About This Program' });
    this.startEnrollmentButton = page.locator('button', { hasText: 'Start Enrollment' });
    this.backToProgramsButton = page.locator('button', { hasText: 'Back to Programs' });
  }

  async startEnrollment(): Promise<void> {
    await this.startEnrollmentButton.click();
  }

  async goBackToPrograms(): Promise<void> {
    await this.backToProgramsButton.click();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.aboutSection).toBeVisible();
    await expect(this.startEnrollmentButton).toBeVisible();
  }
}
