export interface FormSchema {
  formId: string;
  version: string;
  schema: JSONSchema;
}

export interface JSONSchema {
  $schema: string;
  title: string;
  description?: string;
  type: string;
  'x-form-config': FormConfig;
  properties: { [key: string]: FieldDefinition };
  required?: string[];
}

export interface FormConfig {
  formId: string;
  version: string;
  pages: Page[];
}

export interface Page {
  pageId: string;
  title: string;
  sections: Section[];
}

export interface Section {
  sectionId: string;
  title: string;
  description?: string;
  layout: Layout[];
}

export interface Layout {
  type: 'row';
  columns: Column[];
}

export interface Column {
  width: string;  // e.g., "50%", "100%"
  fields: string[];
}

export interface FieldDefinition {
  type: string;
  title: string;
  enum?: any[];
  format?: string;
  pattern?: string;
  'x-field-config': FieldConfig;
}

export interface FieldConfig {
  required: boolean;
  placeholder?: string;
  fieldType: 'text' | 'email' | 'date' | 'phone' | 'select' | 'radio' | 'checkbox' | 'html' | 'button';
  mask?: string;
  options?: SelectOption[];
  layout?: 'horizontal' | 'vertical';
  content?: string;  // for HTML fields
  buttonText?: string;
  action?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}
