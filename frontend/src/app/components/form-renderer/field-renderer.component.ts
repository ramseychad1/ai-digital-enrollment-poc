import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDefinition, FieldConfig } from '../../models/form-schema.model';

@Component({
  selector: 'app-field-renderer',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="field-container" [formGroup]="formGroup">
      <!-- Text input -->
      <div *ngIf="fieldConfig.fieldType === 'text'" class="form-field">
        <label [for]="fieldName">
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <input
          [id]="fieldName"
          [formControlName]="fieldName"
          [placeholder]="fieldConfig.placeholder || ''"
          [class.invalid]="isInvalid()"
          type="text">
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field is required
          </span>
          <span *ngIf="formGroup.get(fieldName)?.errors?.['pattern']">
            Invalid format
          </span>
        </div>
      </div>

      <!-- Email input -->
      <div *ngIf="fieldConfig.fieldType === 'email'" class="form-field">
        <label [for]="fieldName">
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <input
          [id]="fieldName"
          [formControlName]="fieldName"
          [placeholder]="fieldConfig.placeholder || ''"
          [class.invalid]="isInvalid()"
          type="email">
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field is required
          </span>
          <span *ngIf="formGroup.get(fieldName)?.errors?.['email']">
            Please enter a valid email address
          </span>
        </div>
      </div>

      <!-- Date input -->
      <div *ngIf="fieldConfig.fieldType === 'date'" class="form-field">
        <label [for]="fieldName">
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <input
          [id]="fieldName"
          [formControlName]="fieldName"
          [placeholder]="fieldConfig.placeholder || ''"
          [class.invalid]="isInvalid()"
          type="date">
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field is required
          </span>
        </div>
      </div>

      <!-- Phone input -->
      <div *ngIf="fieldConfig.fieldType === 'phone'" class="form-field">
        <label [for]="fieldName">
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <input
          [id]="fieldName"
          [formControlName]="fieldName"
          [placeholder]="fieldConfig.placeholder || ''"
          [class.invalid]="isInvalid()"
          type="tel">
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field is required
          </span>
          <span *ngIf="formGroup.get(fieldName)?.errors?.['pattern']">
            Invalid phone number format
          </span>
        </div>
      </div>

      <!-- Select dropdown -->
      <div *ngIf="fieldConfig.fieldType === 'select'" class="form-field">
        <label [for]="fieldName">
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <select
          [id]="fieldName"
          [formControlName]="fieldName"
          [class.invalid]="isInvalid()">
          <option value="">Select an option</option>
          <option *ngFor="let option of fieldConfig.options"
                  [value]="option.value">
            {{ option.label }}
          </option>
        </select>
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field is required
          </span>
        </div>
      </div>

      <!-- Radio buttons -->
      <div *ngIf="fieldConfig.fieldType === 'radio'" class="form-field">
        <label>
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <div [class]="'radio-group-' + (fieldConfig.layout || 'vertical')">
          <label *ngFor="let option of fieldConfig.options" class="radio-label">
            <input
              type="radio"
              [formControlName]="fieldName"
              [value]="option.value">
            {{ option.label }}
          </label>
        </div>
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field is required
          </span>
        </div>
      </div>

      <!-- Checkbox -->
      <div *ngIf="fieldConfig.fieldType === 'checkbox'" class="form-field">
        <label class="checkbox-label">
          <input
            type="checkbox"
            [formControlName]="fieldName">
          {{ fieldDefinition.title }}
          <span *ngIf="fieldConfig.required" class="required">*</span>
        </label>
        <div *ngIf="isInvalid()" class="error-message">
          <span *ngIf="formGroup.get(fieldName)?.errors?.['required']">
            This field must be checked
          </span>
        </div>
      </div>

      <!-- HTML content -->
      <div *ngIf="fieldConfig.fieldType === 'html'" class="html-content">
        <div [innerHTML]="fieldConfig.content"></div>
      </div>
    </div>
  `,
  styles: [`
    .field-container {
      width: 100%;
    }

    .required {
      color: #dc3545;
      margin-left: 4px;
    }

    .html-content {
      padding: 8px 0;
      line-height: 1.5;
    }
  `]
})
export class FieldRendererComponent {
  @Input() fieldName!: string;
  @Input() fieldDefinition!: FieldDefinition;
  @Input() formGroup!: FormGroup;

  get fieldConfig(): FieldConfig {
    return this.fieldDefinition['x-field-config'];
  }

  isInvalid(): boolean {
    const control = this.formGroup.get(this.fieldName);
    return !!(control && control.invalid && control.touched);
  }
}
