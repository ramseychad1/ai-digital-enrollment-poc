export interface PatientInfo {
  name: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  cellPhone: string;
  email: string;
  alternateContactName: string;
  relationshipToPatient: string;
  primaryLanguage: string;
  alternateContactHomePhone: string;
  alternateContactCellPhone: string;
  preferredContact: 'Home' | 'Cell' | 'Email';
}

export interface InsuranceInfo {
  insuranceName: string;
  insurancePhone: string;
  policyId: string;
  bin: string;
  pcn: string;
  groupNumber: string;
  policyholderName: string;
  policyholderDob: string;
  insuranceType: 'Commercial' | 'Medicare' | 'Medicaid' | 'VA' | 'NoInsurance' | 'Other';
}

export interface AuthorizationInfo {
  name: string;
  signature: string;
  date: string;
  relationship?: string;
}

// Default test patient data
export const testPatient: PatientInfo = {
  name: 'John Test Smith',
  dateOfBirth: '1985-03-15',
  gender: 'Male',
  streetAddress: '123 Main Street',
  city: 'Springfield',
  state: 'IL',
  zip: '62701',
  phone: '555-123-4567',
  cellPhone: '555-987-6543',
  email: 'john.test@example.com',
  alternateContactName: 'Jane Smith',
  relationshipToPatient: 'Spouse',
  primaryLanguage: 'English',
  alternateContactHomePhone: '555-111-2222',
  alternateContactCellPhone: '555-333-4444',
  preferredContact: 'Cell',
};

// Default test insurance data
export const testInsurance: InsuranceInfo = {
  insuranceName: 'Blue Cross Blue Shield',
  insurancePhone: '800-555-1234',
  policyId: 'POL123456789',
  bin: '610014',
  pcn: 'BCBS',
  groupNumber: 'GRP001',
  policyholderName: 'John Test Smith',
  policyholderDob: '1985-03-15',
  insuranceType: 'Commercial',
};

// Default authorization data (uses today's date)
export const getTestAuthorization = (name: string = 'John Test Smith'): AuthorizationInfo => ({
  name,
  signature: name,
  date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
});

// Alternative test data for edge cases
export const testPatientMinimal: PatientInfo = {
  name: 'Jane Doe',
  dateOfBirth: '1990-01-01',
  gender: 'Female',
  streetAddress: '456 Oak Avenue',
  city: 'Chicago',
  state: 'IL',
  zip: '60601',
  phone: '312-555-0001',
  cellPhone: '312-555-0002',
  email: 'jane.doe@test.com',
  alternateContactName: 'John Doe',
  relationshipToPatient: 'Sibling',
  primaryLanguage: 'Spanish',
  alternateContactHomePhone: '312-555-0003',
  alternateContactCellPhone: '312-555-0004',
  preferredContact: 'Email',
};

export const testInsuranceMedicare: InsuranceInfo = {
  insuranceName: 'Medicare',
  insurancePhone: '800-633-4227',
  policyId: 'MBI123456789',
  bin: '004336',
  pcn: 'MCARERX',
  groupNumber: 'MCARE',
  policyholderName: 'Jane Doe',
  policyholderDob: '1990-01-01',
  insuranceType: 'Medicare',
};
