import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { PatientInfo, InsuranceInfo, AuthorizationInfo } from '../fixtures/test-data';

export class EnrollmentFormPage extends BasePage {
  // Page indicators
  readonly pageIndicator: Locator;
  readonly progressBar: Locator;

  // Page 1: Patient Information
  readonly patientName: Locator;
  readonly dateOfBirth: Locator;
  readonly genderMale: Locator;
  readonly genderFemale: Locator;
  readonly streetAddress: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly zip: Locator;
  readonly patientPhone: Locator;
  readonly cellPhone: Locator;
  readonly email: Locator;
  readonly alternateContactName: Locator;
  readonly relationshipToPatient: Locator;
  readonly primaryLanguage: Locator;
  readonly alternateContactHomePhone: Locator;
  readonly alternateContactCellPhone: Locator;
  readonly preferredContactHome: Locator;
  readonly preferredContactCell: Locator;
  readonly preferredContactEmail: Locator;

  // Page 1: Insurance Information
  readonly primaryInsuranceName: Locator;
  readonly insurancePhone: Locator;
  readonly policyId: Locator;
  readonly bin: Locator;
  readonly pcn: Locator;
  readonly groupNumber: Locator;
  readonly policyholderName: Locator;
  readonly policyholderDob: Locator;
  readonly insuranceTypeCommercial: Locator;
  readonly insuranceTypeMedicare: Locator;
  readonly insuranceTypeMedicaid: Locator;
  readonly insuranceTypeNoInsurance: Locator;

  // Navigation
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly submitButton: Locator;

  // Page 2: Authorization
  readonly authPatientName: Locator;
  readonly authSignature: Locator;
  readonly authDate: Locator;
  readonly acknowledgmentName: Locator;
  readonly acknowledgmentSignature: Locator;
  readonly acknowledgmentDate: Locator;

  constructor(page: Page) {
    super(page);

    // Page indicators
    this.pageIndicator = page.locator('text=/Page \\d+ of \\d+/');
    this.progressBar = page.locator('[class*="progress"]');

    // Patient Information fields
    this.patientName = page.locator('input[placeholder="Enter patient name"]');
    this.dateOfBirth = page.locator('input[type="date"]').first();
    this.genderMale = page.locator('input[type="radio"]').first();
    this.genderFemale = page.locator('input[type="radio"]').nth(1);
    this.streetAddress = page.locator('input[placeholder="Enter street address"]');
    this.city = page.locator('input[placeholder="Enter city"]');
    this.state = page.locator('input[placeholder="State"]');
    this.zip = page.locator('input[placeholder="ZIP code"]');
    this.patientPhone = page.locator('input[type="tel"]').first();
    this.cellPhone = page.locator('input[type="tel"]').nth(1);
    this.email = page.locator('input[type="email"]');
    this.alternateContactName = page.locator('input[placeholder="Enter alternate contact name"]');
    this.relationshipToPatient = page.locator('input[placeholder="Enter relationship"]');
    this.primaryLanguage = page.locator('input[placeholder="Enter primary language"]');
    this.alternateContactHomePhone = page.locator('input[type="tel"]').nth(2);
    this.alternateContactCellPhone = page.locator('input[type="tel"]').nth(3);
    this.preferredContactHome = page.locator('text=Home >> xpath=preceding-sibling::input[@type="radio"] | text=Home >> xpath=../input[@type="radio"]').first();
    this.preferredContactCell = page.locator('text=Cell >> xpath=preceding-sibling::input[@type="radio"] | text=Cell >> xpath=../input[@type="radio"]').first();
    this.preferredContactEmail = page.locator('text=Email >> xpath=preceding-sibling::input[@type="radio"] | text=Email >> xpath=../input[@type="radio"]').first();

    // Insurance fields
    this.primaryInsuranceName = page.locator('input[placeholder="Enter insurance name"]');
    this.insurancePhone = page.locator('input[type="tel"]').nth(4);
    this.policyId = page.locator('input[placeholder="Enter policy ID"]').first();
    this.bin = page.locator('input[placeholder="Enter BIN"]').first();
    this.pcn = page.locator('input[placeholder="Enter PCN"]').first();
    this.groupNumber = page.locator('input[placeholder="Enter group number"]').first();
    this.policyholderName = page.locator('input[placeholder="Enter policyholder name"]').first();
    this.policyholderDob = page.locator('input[type="date"]').nth(1);
    this.insuranceTypeCommercial = page.getByText('Commercial/private insurance plan').locator('xpath=preceding-sibling::input[@type="radio"] | xpath=../input[@type="radio"]');
    this.insuranceTypeMedicare = page.getByText('Medicare', { exact: true }).locator('xpath=preceding-sibling::input[@type="radio"] | xpath=../input[@type="radio"]');
    this.insuranceTypeMedicaid = page.getByText('Medicaid', { exact: true }).locator('xpath=preceding-sibling::input[@type="radio"] | xpath=../input[@type="radio"]');
    this.insuranceTypeNoInsurance = page.getByText('No insurance', { exact: true }).first().locator('xpath=preceding-sibling::input[@type="radio"] | xpath=../input[@type="radio"]');

    // Navigation buttons
    this.nextButton = page.locator('button', { hasText: 'Next' });
    this.previousButton = page.locator('button', { hasText: 'Previous' });
    this.submitButton = page.locator('button', { hasText: 'Submit Enrollment' });

    // Page 2: Authorization fields
    this.authPatientName = page.locator('input[placeholder="Enter patient name"]');
    this.authSignature = page.locator('input[placeholder="Signature required"]').first();
    this.authDate = page.locator('input[type="date"]').first();
    this.acknowledgmentName = page.locator('input[placeholder="Enter name"]');
    this.acknowledgmentSignature = page.locator('input[placeholder="Signature required"]').nth(1);
    this.acknowledgmentDate = page.locator('input[type="date"]').nth(1);
  }

  async getCurrentPage(): Promise<string> {
    const text = await this.pageIndicator.textContent();
    return text || '';
  }

  async fillPatientInfo(patient: PatientInfo): Promise<void> {
    await this.patientName.fill(patient.name);
    await this.dateOfBirth.fill(patient.dateOfBirth);

    if (patient.gender === 'Male') {
      await this.genderMale.check();
    } else {
      await this.genderFemale.check();
    }

    await this.streetAddress.fill(patient.streetAddress);
    await this.city.fill(patient.city);
    await this.state.fill(patient.state);
    await this.zip.fill(patient.zip);
    await this.patientPhone.fill(patient.phone);
    await this.cellPhone.fill(patient.cellPhone);
    await this.email.fill(patient.email);
    await this.alternateContactName.fill(patient.alternateContactName);
    await this.relationshipToPatient.fill(patient.relationshipToPatient);
    await this.primaryLanguage.fill(patient.primaryLanguage);
    await this.alternateContactHomePhone.fill(patient.alternateContactHomePhone);
    await this.alternateContactCellPhone.fill(patient.alternateContactCellPhone);

    // Select preferred contact method
    if (patient.preferredContact === 'Cell') {
      await this.page.locator('label', { hasText: 'Cell' }).first().click();
    }
  }

  async fillInsuranceInfo(insurance: InsuranceInfo): Promise<void> {
    await this.primaryInsuranceName.fill(insurance.insuranceName);
    await this.insurancePhone.fill(insurance.insurancePhone);
    await this.policyId.fill(insurance.policyId);
    await this.bin.fill(insurance.bin);
    await this.pcn.fill(insurance.pcn);
    await this.groupNumber.fill(insurance.groupNumber);
    await this.policyholderName.fill(insurance.policyholderName);
    await this.policyholderDob.fill(insurance.policyholderDob);

    // Select insurance type
    await this.page.getByText('Commercial/private insurance').first().click();

    // Select No insurance for secondary
    const secondaryNoInsurance = this.page.locator('text=Secondary Insurance Information').locator('xpath=following::input[@type="radio"]').first();
    if (await secondaryNoInsurance.isVisible()) {
      await secondaryNoInsurance.check();
    }
  }

  async fillAuthorizationInfo(auth: AuthorizationInfo): Promise<void> {
    // Fill Patient Authorization section
    await this.page.locator('input[placeholder="Signature required"]').first().fill(auth.signature);
    await this.page.locator('input[type="date"]').first().fill(auth.date);

    // Fill Patient Acknowledgment section
    await this.page.locator('input[placeholder="Enter name"]').fill(auth.name);
    await this.page.locator('input[placeholder="Signature required"]').nth(1).fill(auth.signature);
    await this.page.locator('input[type="date"]').nth(1).fill(auth.date);
  }

  async goToNextPage(): Promise<void> {
    await this.nextButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async goToPreviousPage(): Promise<void> {
    await this.previousButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async submitEnrollment(): Promise<void> {
    await this.submitButton.click();
  }

  async verifyPage1Loaded(): Promise<void> {
    // Use first() since there are multiple "Patient Information" elements (h2 title and h3 section)
    await expect(this.page.locator('text=Patient Information').first()).toBeVisible();
    await expect(this.patientName).toBeVisible();
  }

  async verifyPage2Loaded(): Promise<void> {
    await expect(this.page.locator('text=Patient Authorization').first()).toBeVisible();
  }

  async verifySubmissionSuccess(): Promise<void> {
    // Handle the alert dialog
    this.page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('successfully');
      await dialog.accept();
    });
  }
}
