export interface JsonSchemaResponse {
  schema: string;
  formId: string;
  confidence: number;
  notes: string;
}

export interface ColorSuggestion {
  colors: string[];
  screenshotBase64: string;
}

export interface LogoResponse {
  found: boolean;
  logoUrl: string | null;
  message: string;
}

export interface ProgramConfig {
  displayName: string;
  manufacturer: string;
  shortDescription: string;
  companyName: string;
  footerText: string;
  websiteUrl: string;
  primaryColor: string;
  primaryButtonColor: string;
  secondaryColor: string;
  secondaryButtonColor: string;
  headerBackgroundColor: string;
  footerBackgroundColor: string;
  formBackgroundColor: string;
  logoUrl: string;
  formSchema: string; // JSON string
  formId: string;
}

export interface PublishResponse {
  success: boolean;
  programId: string;
  formSchemaId: string;
  message: string;
  programUrl: string;
}
