import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * Editable field model for the visual editor
 */
export interface EditableField {
  id: string;
  fieldName: string;
  label: string;
  type: 'text' | 'email' | 'date' | 'phone' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'number';
  required: boolean;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  options?: { value: string; label: string }[];
  pattern?: string;
  format?: string;
}

/**
 * FormSchemaEditorComponent
 *
 * A visual editor for modifying JSON form schemas.
 * Displays a 3-panel layout: Fields List | Properties Editor | Live Preview
 */
@Component({
  selector: 'app-form-schema-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form-schema-editor.component.html',
  styleUrls: ['./form-schema-editor.component.scss']
})
export class FormSchemaEditorComponent implements OnInit {

  /** Input JSON schema string */
  @Input() schemaJson: string = '';

  /** Emits updated JSON when user saves */
  @Output() save = new EventEmitter<string>();

  /** Emits when user cancels */
  @Output() cancel = new EventEmitter<void>();

  /** Parsed schema object */
  parsedSchema: any = null;

  /** List of editable fields */
  fields: EditableField[] = [];

  /** Currently selected field for editing */
  selectedField: EditableField | null = null;

  /** Error message if parsing fails */
  parseError: string | null = null;

  /** Available field types */
  fieldTypes: { value: string; label: string }[] = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'select', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'textarea', label: 'Text Area' }
  ];

  /** New option being added */
  newOptionValue: string = '';
  newOptionLabel: string = '';

  ngOnInit(): void {
    this.parseSchema();
  }

  /**
   * Parse the input JSON schema into editable fields
   */
  parseSchema(): void {
    if (!this.schemaJson) {
      this.parseError = 'No schema provided';
      return;
    }

    try {
      this.parsedSchema = JSON.parse(this.schemaJson);
      this.fields = [];
      this.parseError = null;

      // Extract fields from properties
      if (this.parsedSchema.properties) {
        const requiredFields = this.parsedSchema.required || [];

        for (const [fieldName, fieldDef] of Object.entries(this.parsedSchema.properties)) {
          const def = fieldDef as any;
          const fieldConfig = def['x-field-config'] || {};

          // Skip html and button types (non-input fields)
          if (fieldConfig.fieldType === 'html' || fieldConfig.fieldType === 'button') {
            continue;
          }

          const field: EditableField = {
            id: this.generateId(),
            fieldName: fieldName,
            label: def.title || fieldName,
            type: this.mapFieldType(fieldConfig.fieldType || def.type),
            required: requiredFields.includes(fieldName) || fieldConfig.required === true,
            placeholder: fieldConfig.placeholder || '',
            description: def.description || '',
            maxLength: def.maxLength,
            pattern: def.pattern,
            format: def.format,
            options: this.extractOptions(fieldConfig, def)
          };

          this.fields.push(field);
        }
      }

      // Select first field by default
      if (this.fields.length > 0) {
        this.selectedField = this.fields[0];
      }

    } catch (e: any) {
      this.parseError = 'Invalid JSON: ' + e.message;
      console.error('Schema parse error:', e);
    }
  }

  /**
   * Map field type from schema to editor type
   */
  private mapFieldType(type: string): EditableField['type'] {
    const typeMap: { [key: string]: EditableField['type'] } = {
      'text': 'text',
      'string': 'text',
      'email': 'email',
      'date': 'date',
      'phone': 'phone',
      'tel': 'phone',
      'select': 'select',
      'radio': 'radio',
      'checkbox': 'checkbox',
      'boolean': 'checkbox',
      'textarea': 'textarea',
      'number': 'number',
      'integer': 'number'
    };
    return typeMap[type] || 'text';
  }

  /**
   * Extract options from field config or enum
   */
  private extractOptions(fieldConfig: any, fieldDef: any): { value: string; label: string }[] | undefined {
    if (fieldConfig.options && Array.isArray(fieldConfig.options)) {
      return fieldConfig.options;
    }
    if (fieldDef.enum && Array.isArray(fieldDef.enum)) {
      return fieldDef.enum.map((val: any) => ({ value: String(val), label: String(val) }));
    }
    return undefined;
  }

  /**
   * Generate unique ID for new fields
   */
  private generateId(): string {
    return 'field_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Select a field for editing
   */
  selectField(field: EditableField): void {
    this.selectedField = field;
    this.newOptionValue = '';
    this.newOptionLabel = '';
  }

  /**
   * Add a new field
   */
  addField(): void {
    const newFieldName = 'newField' + (this.fields.length + 1);
    const newField: EditableField = {
      id: this.generateId(),
      fieldName: newFieldName,
      label: 'New Field',
      type: 'text',
      required: false,
      placeholder: ''
    };
    this.fields.push(newField);
    this.selectedField = newField;
  }

  /**
   * Remove a field
   */
  removeField(field: EditableField): void {
    const index = this.fields.indexOf(field);
    if (index > -1) {
      this.fields.splice(index, 1);
      if (this.selectedField === field) {
        this.selectedField = this.fields.length > 0 ? this.fields[0] : null;
      }
    }
  }

  /**
   * Move field up in the list
   */
  moveFieldUp(field: EditableField): void {
    const index = this.fields.indexOf(field);
    if (index > 0) {
      [this.fields[index - 1], this.fields[index]] = [this.fields[index], this.fields[index - 1]];
    }
  }

  /**
   * Move field down in the list
   */
  moveFieldDown(field: EditableField): void {
    const index = this.fields.indexOf(field);
    if (index < this.fields.length - 1) {
      [this.fields[index], this.fields[index + 1]] = [this.fields[index + 1], this.fields[index]];
    }
  }

  /**
   * Add an option to a select/radio field
   */
  addOption(): void {
    if (!this.selectedField || !this.newOptionValue.trim()) return;

    if (!this.selectedField.options) {
      this.selectedField.options = [];
    }

    this.selectedField.options.push({
      value: this.newOptionValue.trim(),
      label: this.newOptionLabel.trim() || this.newOptionValue.trim()
    });

    this.newOptionValue = '';
    this.newOptionLabel = '';
  }

  /**
   * Remove an option from a select/radio field
   */
  removeOption(index: number): void {
    if (this.selectedField?.options) {
      this.selectedField.options.splice(index, 1);
    }
  }

  /**
   * Check if current field type needs options
   */
  needsOptions(): boolean {
    return this.selectedField?.type === 'select' || this.selectedField?.type === 'radio';
  }

  /**
   * Convert field name to camelCase
   */
  sanitizeFieldName(name: string): string {
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
      .replace(/\s/g, '')
      .replace(/^(.)/, c => c.toLowerCase());
  }

  /**
   * Handle field name change - auto sanitize
   */
  onFieldNameChange(): void {
    if (this.selectedField) {
      this.selectedField.fieldName = this.sanitizeFieldName(this.selectedField.fieldName);
    }
  }

  /**
   * Convert editable fields back to JSON schema
   */
  buildSchema(): string {
    if (!this.parsedSchema) {
      return this.schemaJson;
    }

    // Create a copy of the original schema
    const newSchema = JSON.parse(JSON.stringify(this.parsedSchema));

    // Rebuild properties from editable fields
    const newProperties: any = {};
    const newRequired: string[] = [];

    // First, preserve any non-input fields (html, button) from original
    if (this.parsedSchema.properties) {
      for (const [fieldName, fieldDef] of Object.entries(this.parsedSchema.properties)) {
        const def = fieldDef as any;
        const fieldConfig = def['x-field-config'] || {};
        if (fieldConfig.fieldType === 'html' || fieldConfig.fieldType === 'button') {
          newProperties[fieldName] = fieldDef;
        }
      }
    }

    // Add editable fields
    for (const field of this.fields) {
      const fieldDef: any = {
        type: this.getJsonSchemaType(field.type),
        title: field.label
      };

      // Add x-field-config
      const fieldConfig: any = {
        required: field.required,
        fieldType: field.type
      };

      if (field.placeholder) {
        fieldConfig.placeholder = field.placeholder;
      }

      if (field.options && field.options.length > 0) {
        fieldDef.enum = field.options.map(o => o.value);
        fieldConfig.options = field.options;
      }

      if (field.description) {
        fieldDef.description = field.description;
      }

      if (field.maxLength) {
        fieldDef.maxLength = field.maxLength;
      }

      if (field.pattern) {
        fieldDef.pattern = field.pattern;
      }

      if (field.format) {
        fieldDef.format = field.format;
      } else if (field.type === 'email') {
        fieldDef.format = 'email';
      }

      fieldDef['x-field-config'] = fieldConfig;
      newProperties[field.fieldName] = fieldDef;

      if (field.required) {
        newRequired.push(field.fieldName);
      }
    }

    newSchema.properties = newProperties;
    newSchema.required = newRequired;

    // Update x-form-config pages to include new fields if needed
    this.updateFormConfigPages(newSchema);

    return JSON.stringify(newSchema, null, 2);
  }

  /**
   * Get JSON Schema type from editor type
   */
  private getJsonSchemaType(type: EditableField['type']): string {
    if (type === 'checkbox') return 'boolean';
    if (type === 'number') return 'number';
    return 'string';
  }

  /**
   * Update x-form-config pages to ensure all fields are included
   */
  private updateFormConfigPages(schema: any): void {
    if (!schema['x-form-config']?.pages) return;

    // Get all fields currently in the layout
    const fieldsInLayout = new Set<string>();
    for (const page of schema['x-form-config'].pages) {
      for (const section of page.sections || []) {
        for (const row of section.layout || []) {
          for (const col of row.columns || []) {
            for (const fieldName of col.fields || []) {
              fieldsInLayout.add(fieldName);
            }
          }
        }
      }
    }

    // Find fields not in layout
    const missingFields = this.fields
      .map(f => f.fieldName)
      .filter(name => !fieldsInLayout.has(name));

    // Add missing fields to the first page, first section
    if (missingFields.length > 0 && schema['x-form-config'].pages.length > 0) {
      const firstPage = schema['x-form-config'].pages[0];
      if (!firstPage.sections || firstPage.sections.length === 0) {
        firstPage.sections = [{
          sectionId: 'section-new-fields',
          title: 'Additional Fields',
          layout: []
        }];
      }

      const firstSection = firstPage.sections[0];
      if (!firstSection.layout) {
        firstSection.layout = [];
      }

      // Add each missing field as a new row
      for (const fieldName of missingFields) {
        firstSection.layout.push({
          type: 'row',
          columns: [{
            width: '100%',
            fields: [fieldName]
          }]
        });
      }
    }

    // Remove fields from layout that no longer exist
    const currentFieldNames = new Set(this.fields.map(f => f.fieldName));
    for (const page of schema['x-form-config'].pages) {
      for (const section of page.sections || []) {
        for (const row of section.layout || []) {
          for (const col of row.columns || []) {
            col.fields = (col.fields || []).filter((name: string) => {
              // Keep the field if it exists in our list or if it's a special field (html, button)
              if (currentFieldNames.has(name)) return true;
              // Check if it's a special field in original schema
              const origField = this.parsedSchema?.properties?.[name];
              if (origField?.['x-field-config']?.fieldType === 'html' ||
                  origField?.['x-field-config']?.fieldType === 'button') {
                return true;
              }
              return false;
            });
          }
        }
      }
    }
  }

  /**
   * Handle save button click
   */
  onSave(): void {
    const updatedJson = this.buildSchema();
    this.save.emit(updatedJson);
  }

  /**
   * Handle cancel button click
   */
  onCancel(): void {
    this.cancel.emit();
  }

  /**
   * Get preview input type for HTML
   */
  getPreviewInputType(type: EditableField['type']): string {
    const typeMap: { [key: string]: string } = {
      'text': 'text',
      'email': 'email',
      'phone': 'tel',
      'number': 'number',
      'date': 'date',
      'textarea': 'textarea',
      'select': 'select',
      'radio': 'radio',
      'checkbox': 'checkbox'
    };
    return typeMap[type] || 'text';
  }
}
