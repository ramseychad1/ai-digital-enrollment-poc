import { Page, Locator } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  protected async fillField(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  protected async selectRadio(locator: Locator): Promise<void> {
    await locator.check();
  }

  protected async clickButton(locator: Locator): Promise<void> {
    await locator.click();
  }
}
