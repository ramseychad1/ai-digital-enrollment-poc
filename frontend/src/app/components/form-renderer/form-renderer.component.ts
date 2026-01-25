import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';
import { JSONSchema, Page } from '../../models/form-schema.model';
import { Submission } from '../../models/submission.model';
import { Program } from '../../models/program.model';
import { ProgramService } from '../../services/program.service';
import { FormService } from '../../services/form.service';
import { SubmissionService } from '../../services/submission.service';
import { BrandingService } from '../../services/branding.service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';
import { FieldRendererComponent } from './field-renderer.component';

@Component({
  selector: 'app-form-renderer',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderComponent,
    FooterComponent,
    FieldRendererComponent
  ],
  templateUrl: './form-renderer.component.html',
  styleUrl: './form-renderer.component.scss'
})
export class FormRendererComponent implements OnInit {
  formGroup!: FormGroup;
  formSchema!: JSONSchema;
  program?: Program;
  programId!: string;
  currentPageIndex: number = 0;
  isLoading: boolean = true;
  errorMessage: string = '';
  isSubmitting: boolean = false;
  submitError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramService,
    private formService: FormService,
    private submissionService: SubmissionService,
    private brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    this.programId = this.route.snapshot.paramMap.get('programId') || '';
    if (this.programId) {
      this.loadForm();
    } else {
      this.errorMessage = 'Program ID not found';
      this.isLoading = false;
    }
  }

  loadForm(): void {
    this.isLoading = true;
    this.programService.getProgramById(this.programId).pipe(
      tap((program) => {
        this.program = program;
        // Apply program branding
        this.brandingService.applyProgramBranding(program);
      }),
      switchMap((program) => {
        if (!program.formSchemaId) {
          throw new Error('Form schema not found for this program');
        }
        return this.formService.getFormSchema(program.formSchemaId);
      }),
      catchError((error) => {
        console.error('Failed to load form', error);
        this.errorMessage = 'Unable to load enrollment form. Please try again later.';
        this.isLoading = false;
        return of(null);
      })
    ).subscribe((formSchema) => {
      if (formSchema) {
        this.formSchema = formSchema.schema;
        this.buildFormFromSchema(this.formSchema);
        this.isLoading = false;
      }
    });
  }

  buildFormFromSchema(schema: JSONSchema): void {
    const formControls: { [key: string]: FormControl } = {};

    Object.keys(schema.properties).forEach(fieldName => {
      const field = schema.properties[fieldName];
      const fieldConfig = field['x-field-config'];

      // Skip HTML and button fields as they don't need form controls
      if (fieldConfig.fieldType === 'html' || fieldConfig.fieldType === 'button') {
        return;
      }

      const validators = [];

      // Required validation
      if (fieldConfig.required || schema.required?.includes(fieldName)) {
        validators.push(Validators.required);
      }

      // Email validation
      if (field.format === 'email' || fieldConfig.fieldType === 'email') {
        validators.push(Validators.email);
      }

      // Pattern validation
      if (field.pattern) {
        validators.push(Validators.pattern(field.pattern));
      }

      // Initialize with empty value (false for checkboxes)
      const initialValue = fieldConfig.fieldType === 'checkbox' ? false : '';
      formControls[fieldName] = new FormControl(initialValue, validators);
    });

    this.formGroup = new FormGroup(formControls);
  }

  get currentPage(): Page | undefined {
    return this.formSchema?.['x-form-config']?.pages[this.currentPageIndex];
  }

  get totalPages(): number {
    return this.formSchema?.['x-form-config']?.pages?.length || 0;
  }

  get isFirstPage(): boolean {
    return this.currentPageIndex === 0;
  }

  get isLastPage(): boolean {
    return this.currentPageIndex === this.totalPages - 1;
  }

  nextPage(): void {
    if (!this.isLastPage) {
      // Mark current page fields as touched to show validation
      this.markCurrentPageAsTouched();

      // Check if current page is valid
      if (this.isCurrentPageValid()) {
        this.currentPageIndex++;
        window.scrollTo(0, 0);
      }
    }
  }

  previousPage(): void {
    if (!this.isFirstPage) {
      this.currentPageIndex--;
      window.scrollTo(0, 0);
    }
  }

  markCurrentPageAsTouched(): void {
    const page = this.currentPage;
    if (!page) return;

    page.sections.forEach(section => {
      section.layout.forEach(row => {
        row.columns.forEach(column => {
          column.fields.forEach(fieldName => {
            this.formGroup.get(fieldName)?.markAsTouched();
          });
        });
      });
    });
  }

  isCurrentPageValid(): boolean {
    const page = this.currentPage;
    if (!page) return true;

    let isValid = true;
    page.sections.forEach(section => {
      section.layout.forEach(row => {
        row.columns.forEach(column => {
          column.fields.forEach(fieldName => {
            const control = this.formGroup.get(fieldName);
            if (control && control.invalid) {
              isValid = false;
            }
          });
        });
      });
    });

    return isValid;
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      this.isSubmitting = true;
      this.submitError = '';

      const submission: Submission = {
        programId: this.programId,
        formId: this.formSchema['x-form-config'].formId,
        formType: 'patient-enrollment',
        formData: this.formGroup.value
      };

      this.submissionService.submitForm(submission).subscribe({
        next: (response) => {
          console.log('Submission successful', response);
          this.isSubmitting = false;
          // Navigate to success page or show success message
          alert('Enrollment submitted successfully!');
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Submission failed', error);
          this.submitError = 'Failed to submit enrollment. Please try again.';
          this.isSubmitting = false;
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      this.formGroup.markAllAsTouched();
      this.submitError = 'Please fill in all required fields correctly.';
    }
  }

  goBack(): void {
    this.router.navigate(['/enroll', this.programId]);
  }
}
