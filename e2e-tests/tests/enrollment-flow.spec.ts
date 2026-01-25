import { test, expect, Page } from '@playwright/test';
import { ProgramSelectorPage, ProgramLandingPage } from '../pages';
import { testPatient, testInsurance, getTestAuthorization } from '../fixtures/test-data';

test.describe('Enrollment Flow', () => {
  let programSelector: ProgramSelectorPage;

  test.beforeEach(async ({ page }) => {
    programSelector = new ProgramSelectorPage(page);
  });

  // Helper to handle new tab opening
  async function clickAndWaitForNewTab(context: any, clickAction: () => Promise<void>): Promise<Page> {
    const pagePromise = context.waitForEvent('page');
    await clickAction();
    const newPage = await pagePromise;
    await newPage.waitForLoadState('networkidle');
    return newPage;
  }

  test('should display program selector page with available programs', async ({ page }) => {
    await programSelector.goto();
    await programSelector.verifyPageLoaded();

    const programCount = await programSelector.getProgramCount();
    expect(programCount).toBeGreaterThan(0);
  });

  test('should navigate to program landing page when selecting a program', async ({ page, context }) => {
    await programSelector.goto();
    await programSelector.verifyPageLoaded();

    const newPage = await clickAndWaitForNewTab(context, async () => {
      await programSelector.selectProgramByIndex(0);
    });

    await expect(newPage).toHaveURL(/\/enroll\//);
    await expect(newPage.locator('text=About This Program')).toBeVisible();
  });

  test('should complete full enrollment flow', async ({ page, context }) => {
    // Step 1: Navigate to program selector and select first program
    await programSelector.goto();
    await programSelector.verifyPageLoaded();

    const newPage = await clickAndWaitForNewTab(context, async () => {
      await programSelector.selectProgramByIndex(0);
    });

    // Step 2: Start enrollment from landing page
    await expect(newPage.locator('text=About This Program')).toBeVisible();
    await newPage.locator('button', { hasText: 'Start Enrollment' }).click();
    await newPage.waitForURL(/\/form/);

    // Step 3: Verify we're on page 1 of the form
    await expect(newPage.locator('text=Page 1 of 2')).toBeVisible();

    // Step 4: Fill Patient Information using placeholder-based selectors
    await newPage.locator('input[placeholder="Enter patient name"]').fill(testPatient.name);
    await newPage.locator('input[type="date"]').first().fill(testPatient.dateOfBirth);
    await newPage.locator('input[type="radio"]').first().check(); // Gender Male
    await newPage.locator('input[placeholder="Enter street address"]').fill(testPatient.streetAddress);
    await newPage.locator('input[placeholder="Enter city"]').fill(testPatient.city);
    await newPage.locator('input[placeholder="State"]').fill(testPatient.state);
    await newPage.locator('input[placeholder="ZIP code"]').fill(testPatient.zip);

    // Phone fields by index
    const telInputs = newPage.locator('input[type="tel"]');
    await telInputs.nth(0).fill(testPatient.phone);
    await telInputs.nth(1).fill(testPatient.cellPhone);

    await newPage.locator('input[type="email"]').fill(testPatient.email);
    await newPage.locator('input[placeholder="Enter alternate contact name"]').fill(testPatient.alternateContactName);
    await newPage.locator('input[placeholder="Enter relationship"]').fill(testPatient.relationshipToPatient);
    await newPage.locator('input[placeholder="Enter primary language"]').fill(testPatient.primaryLanguage);

    await telInputs.nth(2).fill(testPatient.alternateContactHomePhone);
    await telInputs.nth(3).fill(testPatient.alternateContactCellPhone);

    // Select preferred contact (Cell)
    await newPage.getByText('Cell', { exact: true }).first().click();

    // Step 5: Fill Insurance Information
    await newPage.locator('input[placeholder="Enter insurance name"]').fill(testInsurance.insuranceName);
    await telInputs.nth(4).fill(testInsurance.insurancePhone);
    await newPage.locator('input[placeholder="Enter policy ID"]').first().fill(testInsurance.policyId);
    await newPage.locator('input[placeholder="Enter BIN"]').first().fill(testInsurance.bin);
    await newPage.locator('input[placeholder="Enter PCN"]').first().fill(testInsurance.pcn);
    await newPage.locator('input[placeholder="Enter group number"]').first().fill(testInsurance.groupNumber);
    await newPage.locator('input[placeholder="Enter policyholder name"]').first().fill(testInsurance.policyholderName);
    await newPage.locator('input[type="date"]').nth(1).fill(testInsurance.policyholderDob);

    // Select Commercial insurance
    await newPage.getByText('Commercial/private insurance').first().click();

    // Select No insurance for secondary
    await newPage.locator('text=Secondary Insurance Information').scrollIntoViewIfNeeded();
    await newPage.getByText('No insurance').nth(1).click();

    // Step 6: Click Next to go to page 2
    await newPage.locator('button', { hasText: 'Next' }).click();
    await newPage.waitForLoadState('networkidle');

    // Step 7: Verify we're on page 2
    await expect(newPage.locator('text=Page 2 of 2')).toBeVisible();
    await expect(newPage.locator('text=Patient Authorization').first()).toBeVisible();

    // Step 8: Fill Authorization
    const auth = getTestAuthorization(testPatient.name);
    await newPage.locator('input[placeholder="Signature required"]').first().fill(auth.signature);
    await newPage.locator('input[type="date"]').first().fill(auth.date);
    await newPage.locator('input[placeholder="Enter name"]').fill(auth.name);
    await newPage.locator('input[placeholder="Signature required"]').nth(1).fill(auth.signature);
    await newPage.locator('input[type="date"]').nth(1).fill(auth.date);

    // Step 9: Submit
    newPage.once('dialog', async dialog => {
      expect(dialog.message()).toContain('successfully');
      await dialog.accept();
    });

    await newPage.locator('button', { hasText: 'Submit Enrollment' }).click();
    await newPage.waitForTimeout(1000);
  });

  test('should navigate back from landing page to program selector', async ({ page, context }) => {
    await programSelector.goto();
    await programSelector.verifyPageLoaded();

    const newPage = await clickAndWaitForNewTab(context, async () => {
      await programSelector.selectProgramByIndex(0);
    });

    await expect(newPage.locator('text=About This Program')).toBeVisible();
    await newPage.locator('button', { hasText: 'Back to Programs' }).click();
    await newPage.waitForURL('/');
  });

  test('should preserve data when navigating between form pages', async ({ page, context }) => {
    await programSelector.goto();
    await programSelector.verifyPageLoaded();

    const newPage = await clickAndWaitForNewTab(context, async () => {
      await programSelector.selectProgramByIndex(0);
    });

    // Start enrollment
    await newPage.locator('button', { hasText: 'Start Enrollment' }).click();
    await newPage.waitForURL(/\/form/);

    // Fill just the patient name
    const patientNameInput = newPage.locator('input[placeholder="Enter patient name"]');
    await patientNameInput.fill(testPatient.name);

    // Fill minimum required fields to go to next page
    await newPage.locator('input[type="date"]').first().fill(testPatient.dateOfBirth);
    await newPage.locator('input[type="radio"]').first().check();
    await newPage.locator('input[placeholder="Enter street address"]').fill(testPatient.streetAddress);
    await newPage.locator('input[placeholder="Enter city"]').fill(testPatient.city);
    await newPage.locator('input[placeholder="State"]').fill(testPatient.state);
    await newPage.locator('input[placeholder="ZIP code"]').fill(testPatient.zip);

    const telInputs = newPage.locator('input[type="tel"]');
    await telInputs.nth(0).fill(testPatient.phone);
    await telInputs.nth(1).fill(testPatient.cellPhone);
    await newPage.locator('input[type="email"]').fill(testPatient.email);
    await newPage.locator('input[placeholder="Enter alternate contact name"]').fill(testPatient.alternateContactName);
    await newPage.locator('input[placeholder="Enter relationship"]').fill(testPatient.relationshipToPatient);
    await newPage.locator('input[placeholder="Enter primary language"]').fill(testPatient.primaryLanguage);
    await telInputs.nth(2).fill(testPatient.alternateContactHomePhone);
    await telInputs.nth(3).fill(testPatient.alternateContactCellPhone);
    await newPage.getByText('Cell', { exact: true }).first().click();

    // Fill insurance
    await newPage.locator('input[placeholder="Enter insurance name"]').fill(testInsurance.insuranceName);
    await telInputs.nth(4).fill(testInsurance.insurancePhone);
    await newPage.locator('input[placeholder="Enter policy ID"]').first().fill(testInsurance.policyId);
    await newPage.locator('input[placeholder="Enter BIN"]').first().fill(testInsurance.bin);
    await newPage.locator('input[placeholder="Enter PCN"]').first().fill(testInsurance.pcn);
    await newPage.locator('input[placeholder="Enter group number"]').first().fill(testInsurance.groupNumber);
    await newPage.locator('input[placeholder="Enter policyholder name"]').first().fill(testInsurance.policyholderName);
    await newPage.locator('input[type="date"]').nth(1).fill(testInsurance.policyholderDob);
    await newPage.getByText('Commercial/private insurance').first().click();
    await newPage.getByText('No insurance').nth(1).click();

    // Go to next page
    await newPage.locator('button', { hasText: 'Next' }).click();
    await newPage.waitForLoadState('networkidle');
    await expect(newPage.locator('text=Page 2 of 2')).toBeVisible();

    // Go back to page 1
    await newPage.locator('button', { hasText: 'Previous' }).click();
    await newPage.waitForLoadState('networkidle');

    // Verify data is preserved
    const savedName = await patientNameInput.inputValue();
    expect(savedName).toBe(testPatient.name);
  });
});
