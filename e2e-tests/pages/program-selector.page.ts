import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ProgramSelectorPage extends BasePage {
  // Locators
  readonly pageTitle: Locator;
  readonly programCards: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('h1', { hasText: 'AI Digital Enrollment' });
    this.programCards = page.locator('.program-card, [class*="card"]').filter({ has: page.locator('button', { hasText: 'Enroll Now' }) });
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  async getProgramCount(): Promise<number> {
    return this.programCards.count();
  }

  async selectProgramByName(programName: string): Promise<void> {
    const card = this.page.locator('[class*="card"]', { hasText: programName });
    const enrollButton = card.locator('button', { hasText: 'Enroll Now' });
    await enrollButton.click();
  }

  async selectProgramByIndex(index: number): Promise<void> {
    const enrollButtons = this.page.locator('button', { hasText: 'Enroll Now' });
    await enrollButtons.nth(index).click();
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
  }
}
