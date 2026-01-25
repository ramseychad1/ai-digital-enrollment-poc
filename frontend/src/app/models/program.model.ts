export interface Program {
  programId: string;
  displayName: string;
  manufacturer?: string;
  shortDescription?: string;
  logoUrl?: string;
  isActive: boolean;
  formSchemaId?: string;

  // Branding fields
  primaryColor?: string;
  primaryButtonColor?: string;
  secondaryColor?: string;
  secondaryButtonColor?: string;
  headerBackgroundColor?: string;
  footerBackgroundColor?: string;
  formBackgroundColor?: string;
  footerText?: string;
  companyName?: string;
}
