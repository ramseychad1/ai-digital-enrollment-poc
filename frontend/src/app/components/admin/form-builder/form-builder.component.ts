import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ColorPickerModule } from 'ngx-color-picker';
import { IdpService } from '../../../services/idp.service';
import { ProgramService } from '../../../services/program.service';
import { FormService } from '../../../services/form.service';
import { JsonSchemaResponse, ProgramConfig } from '../../../models/idp.model';
import { Program } from '../../../models/program.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ColorZoneConfiguratorComponent } from '../color-zone-configurator/color-zone-configurator.component';
import { FormSchemaEditorComponent } from '../form-schema-editor/form-schema-editor.component';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorPickerModule, HeaderComponent, FooterComponent, ColorZoneConfiguratorComponent, FormSchemaEditorComponent],
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {
  // ViewChild reference to color zone configurator
  @ViewChild(ColorZoneConfiguratorComponent) colorZoneConfigurator!: ColorZoneConfiguratorComponent;

  // Existing properties
  selectedFile: File | null = null;
  pdfPreviewUrl: SafeResourceUrl | null = null;
  isAnalyzing = false;
  generatedSchema: string | null = null;
  formId: string | null = null;
  analysisNotes: string | null = null;
  errorMessage: string | null = null;

  // Edit mode properties
  isEditMode = false;
  isEditPdfMode = false;  // Edit with new PDF upload
  editProgramId: string | null = null;
  isLoadingProgram = false;

  // NEW: Wizard state
  currentStep: number = 1;

  // NEW: Program configuration
  programConfig: Partial<ProgramConfig> = {
    primaryColor: '#E41F35',
    primaryButtonColor: '#E41F35',
    secondaryColor: '#000000',
    secondaryButtonColor: '#000000',
    headerBackgroundColor: '#000000',
    footerBackgroundColor: '#000000',
    formBackgroundColor: '#FFFFFF'
  };

  // NEW: Screenshot and color suggestions
  websiteScreenshot: string | null = null;
  suggestedColors: string[] = [];
  isCapturingScreenshot = false;
  isFetchingLogo = false;

  // NEW: Publishing state
  isPublishing = false;
  publishSuccess = false;
  publishMessage: string | null = null;

  // NEW: Visual schema editor state
  showSchemaEditor = false;

  constructor(
    private idpService: IdpService,
    private programService: ProgramService,
    private formService: FormService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Check if we're in edit mode or edit-pdf mode
    this.route.params.subscribe(params => {
      if (params['programId']) {
        this.editProgramId = params['programId'];

        // Check URL to determine which edit mode
        const url = this.router.url;
        if (url.includes('edit-pdf')) {
          this.isEditPdfMode = true;
          this.isEditMode = false;
          this.loadProgramForEditPdf(this.editProgramId!);
        } else {
          this.isEditMode = true;
          this.isEditPdfMode = false;
          this.loadProgramForEdit(this.editProgramId!);
        }
      }
    });
  }

  private loadProgramForEdit(programId: string): void {
    this.isLoadingProgram = true;
    this.programService.getProgramById(programId).subscribe({
      next: (program: Program) => {
        // Populate programConfig with existing data
        this.programConfig = {
          displayName: program.displayName,
          manufacturer: program.manufacturer,
          shortDescription: program.shortDescription,
          companyName: program.companyName,
          footerText: program.footerText,
          primaryColor: program.primaryColor || '#E41F35',
          primaryButtonColor: program.primaryButtonColor || program.primaryColor || '#E41F35',
          secondaryColor: program.secondaryColor || '#000000',
          secondaryButtonColor: program.secondaryButtonColor || program.secondaryColor || '#000000',
          headerBackgroundColor: program.headerBackgroundColor || '#000000',
          footerBackgroundColor: program.footerBackgroundColor || '#000000',
          formBackgroundColor: program.formBackgroundColor || '#FFFFFF',
          logoUrl: program.logoUrl
        };
        this.formId = program.formSchemaId || null;

        // Load the existing form schema if it exists
        if (this.formId) {
          this.formService.getFormSchema(this.formId).subscribe({
            next: (formSchema) => {
              this.generatedSchema = JSON.stringify(formSchema.schema, null, 2);
              // In edit mode, skip to Configure step (step 3)
              this.currentStep = 3;
              this.isLoadingProgram = false;
            },
            error: (error) => {
              console.error('Error loading form schema', error);
              this.errorMessage = 'Failed to load form schema. Please try again.';
              this.isLoadingProgram = false;
            }
          });
        } else {
          // No form schema exists, proceed to Configure step anyway
          this.currentStep = 3;
          this.isLoadingProgram = false;
        }
      },
      error: (error) => {
        console.error('Error loading program for edit', error);
        this.errorMessage = 'Failed to load program. Please try again.';
        this.isLoadingProgram = false;
      }
    });
  }

  private loadProgramForEditPdf(programId: string): void {
    this.isLoadingProgram = true;
    this.programService.getProgramById(programId).subscribe({
      next: (program: Program) => {
        // Populate programConfig with existing data (will be preserved through PDF upload)
        this.programConfig = {
          displayName: program.displayName,
          manufacturer: program.manufacturer,
          shortDescription: program.shortDescription,
          companyName: program.companyName,
          footerText: program.footerText,
          primaryColor: program.primaryColor || '#E41F35',
          primaryButtonColor: program.primaryButtonColor || program.primaryColor || '#E41F35',
          secondaryColor: program.secondaryColor || '#000000',
          secondaryButtonColor: program.secondaryButtonColor || program.secondaryColor || '#000000',
          headerBackgroundColor: program.headerBackgroundColor || '#000000',
          footerBackgroundColor: program.footerBackgroundColor || '#000000',
          formBackgroundColor: program.formBackgroundColor || '#FFFFFF',
          logoUrl: program.logoUrl
        };

        // In edit-pdf mode, start at step 1 (Upload PDF)
        this.currentStep = 1;
        this.isLoadingProgram = false;
      },
      error: (error) => {
        console.error('Error loading program for edit-pdf', error);
        this.errorMessage = 'Failed to load program. Please try again.';
        this.isLoadingProgram = false;
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      const url = URL.createObjectURL(file);
      this.pdfPreviewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.errorMessage = null;
      this.generatedSchema = null;
    } else {
      this.errorMessage = 'Please select a valid PDF file';
      this.selectedFile = null;
      this.pdfPreviewUrl = null;
    }
  }

  analyzePdf(): void {
    if (!this.selectedFile) {
      return;
    }

    this.isAnalyzing = true;
    this.errorMessage = null;

    this.idpService.analyzePdf(this.selectedFile).subscribe({
      next: (response: JsonSchemaResponse) => {
        this.generatedSchema = response.schema;
        this.formId = response.formId;
        this.analysisNotes = response.notes;
        this.isAnalyzing = false;

        // Pre-populate program config from schema title and description
        this.extractSchemaMetadata();
      },
      error: (error) => {
        console.error('Error analyzing PDF', error);
        this.errorMessage = 'Failed to analyze PDF. Please try again.';
        this.isAnalyzing = false;
      }
    });
  }

  /**
   * Extract title and description from the generated schema
   * and pre-populate the program config fields
   * In edit-pdf mode, don't overwrite existing values
   */
  private extractSchemaMetadata(): void {
    if (!this.generatedSchema) {
      return;
    }

    try {
      const schema = JSON.parse(this.generatedSchema);

      // In edit-pdf mode, keep existing program config values
      if (!this.isEditPdfMode) {
        if (schema.title) {
          this.programConfig.displayName = schema.title;
        }

        if (schema.description) {
          this.programConfig.shortDescription = schema.description;
        }
      }
    } catch (error) {
      console.warn('Could not parse schema for metadata extraction', error);
    }
  }

  downloadSchema(): void {
    if (!this.generatedSchema) {
      return;
    }

    const blob = new Blob([this.generatedSchema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.formId || 'form-schema'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  copyToClipboard(): void {
    if (!this.generatedSchema) {
      return;
    }

    navigator.clipboard.writeText(this.generatedSchema).then(() => {
      alert('Schema copied to clipboard!');
    });
  }

  reset(): void {
    this.selectedFile = null;
    this.pdfPreviewUrl = null;
    this.generatedSchema = null;
    this.formId = null;
    this.analysisNotes = null;
    this.errorMessage = null;
  }

  // NEW: Navigation methods
  nextStep(): void {
    if (this.currentStep < 4) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceedToStep2(): boolean {
    return this.generatedSchema !== null;
  }

  canProceedToStep3(): boolean {
    return !!(
      this.programConfig.displayName &&
      this.programConfig.manufacturer &&
      this.programConfig.shortDescription
    );
  }

  canProceedToStep4(): boolean {
    return !!(
      this.programConfig.companyName &&
      this.programConfig.primaryColor
    );
  }

  // NEW: Capture screenshot and suggest colors
  captureScreenshot(): void {
    if (!this.programConfig.websiteUrl) {
      return;
    }

    this.isCapturingScreenshot = true;

    this.idpService.captureScreenshot(this.programConfig.websiteUrl).subscribe({
      next: (response) => {
        if (response.screenshotBase64) {
          this.websiteScreenshot = 'data:image/png;base64,' + response.screenshotBase64;
          alert('Screenshot captured successfully! Click color swatches below to apply colors to your form.');
        } else {
          this.websiteScreenshot = null;
          alert('Screenshot unavailable - the website is blocking automated screenshots (common with pharmaceutical sites). Default color suggestions are provided below, or you can manually enter colors from the website.');
        }
        this.suggestedColors = response.colors;
        this.isCapturingScreenshot = false;
      },
      error: (error) => {
        console.error('Error capturing screenshot', error);
        alert('Failed to capture screenshot. You can manually enter colors from the website.');
        this.isCapturingScreenshot = false;
      }
    });
  }

  // NEW: Apply suggested color
  applyColor(color: string, field: string): void {
    (this.programConfig as any)[field] = color;
  }

  // Helper to get contrasting text color for color inputs
  getContrastColor(hexColor: string | undefined): string {
    if (!hexColor) return '#000000';
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  // NEW: Fetch logo
  fetchLogo(): void {
    if (!this.programConfig.websiteUrl) {
      return;
    }

    this.isFetchingLogo = true;

    this.idpService.fetchLogo(this.programConfig.websiteUrl).subscribe({
      next: (response) => {
        if (response.found && response.logoUrl) {
          this.programConfig.logoUrl = response.logoUrl;
        } else {
          alert('Logo not found. Please paste URL manually or leave blank.');
        }
        this.isFetchingLogo = false;
      },
      error: (error) => {
        console.error('Error fetching logo', error);
        alert('Failed to fetch logo');
        this.isFetchingLogo = false;
      }
    });
  }

  // NEW: Publish to Contentful
  publishToContentful(): void {
    this.isPublishing = true;
    this.publishSuccess = false;
    this.publishMessage = null;

    const config: ProgramConfig = {
      displayName: this.programConfig.displayName!,
      manufacturer: this.programConfig.manufacturer!,
      shortDescription: this.programConfig.shortDescription!,
      companyName: this.programConfig.companyName!,
      footerText: this.programConfig.footerText || `© ${new Date().getFullYear()} ${this.programConfig.companyName}. All rights reserved.`,
      websiteUrl: this.programConfig.websiteUrl || '',
      primaryColor: this.programConfig.primaryColor!,
      primaryButtonColor: this.programConfig.primaryButtonColor!,
      secondaryColor: this.programConfig.secondaryColor!,
      secondaryButtonColor: this.programConfig.secondaryButtonColor!,
      headerBackgroundColor: this.programConfig.headerBackgroundColor!,
      footerBackgroundColor: this.programConfig.footerBackgroundColor!,
      formBackgroundColor: this.programConfig.formBackgroundColor || '#FFFFFF',
      logoUrl: this.programConfig.logoUrl || '',
      formSchema: this.generatedSchema!,
      formId: this.formId!
    };

    this.idpService.publishToContentful(config).subscribe({
      next: (response) => {
        this.publishSuccess = response.success;
        this.publishMessage = response.message;
        this.isPublishing = false;

        if (response.success) {
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error publishing', error);
        this.publishMessage = 'Failed to publish to Contentful';
        this.publishSuccess = false;
        this.isPublishing = false;
      }
    });
  }

  // Update existing program in Contentful
  updateProgram(): void {
    if (!this.editProgramId) return;

    this.isPublishing = true;
    this.publishSuccess = false;
    this.publishMessage = null;

    const updateData = {
      programId: this.editProgramId,
      displayName: this.programConfig.displayName!,
      manufacturer: this.programConfig.manufacturer!,
      shortDescription: this.programConfig.shortDescription!,
      companyName: this.programConfig.companyName!,
      footerText: this.programConfig.footerText,
      primaryColor: this.programConfig.primaryColor!,
      primaryButtonColor: this.programConfig.primaryButtonColor!,
      secondaryColor: this.programConfig.secondaryColor!,
      secondaryButtonColor: this.programConfig.secondaryButtonColor!,
      headerBackgroundColor: this.programConfig.headerBackgroundColor!,
      footerBackgroundColor: this.programConfig.footerBackgroundColor!,
      formBackgroundColor: this.programConfig.formBackgroundColor || '#FFFFFF',
      logoUrl: this.programConfig.logoUrl || ''
    };

    this.idpService.updateProgram(this.editProgramId, updateData).subscribe({
      next: (response) => {
        this.publishSuccess = response.success;
        this.publishMessage = response.message;
        this.isPublishing = false;

        if (response.success) {
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error updating program', error);
        this.publishMessage = 'Failed to update program';
        this.publishSuccess = false;
        this.isPublishing = false;
      }
    });
  }

  // Navigate back to program list
  cancelEdit(): void {
    this.router.navigate(['/']);
  }

  // Update existing program with new PDF/schema
  updateProgramWithSchema(): void {
    if (!this.editProgramId) return;

    this.isPublishing = true;
    this.publishSuccess = false;
    this.publishMessage = null;

    const updateData = {
      programId: this.editProgramId,
      displayName: this.programConfig.displayName!,
      manufacturer: this.programConfig.manufacturer!,
      shortDescription: this.programConfig.shortDescription!,
      companyName: this.programConfig.companyName!,
      footerText: this.programConfig.footerText || `© ${new Date().getFullYear()} ${this.programConfig.companyName}. All rights reserved.`,
      primaryColor: this.programConfig.primaryColor!,
      primaryButtonColor: this.programConfig.primaryButtonColor!,
      secondaryColor: this.programConfig.secondaryColor!,
      secondaryButtonColor: this.programConfig.secondaryButtonColor!,
      headerBackgroundColor: this.programConfig.headerBackgroundColor!,
      footerBackgroundColor: this.programConfig.footerBackgroundColor!,
      formBackgroundColor: this.programConfig.formBackgroundColor || '#FFFFFF',
      logoUrl: this.programConfig.logoUrl || '',
      formSchema: this.generatedSchema!,
      formId: this.formId!
    };

    this.idpService.updateProgramWithSchema(this.editProgramId, updateData).subscribe({
      next: (response) => {
        this.publishSuccess = response.success;
        this.publishMessage = response.message;
        this.isPublishing = false;

        if (response.success) {
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
      },
      error: (error) => {
        console.error('Error updating program with new schema', error);
        this.publishMessage = 'Failed to update program';
        this.publishSuccess = false;
        this.isPublishing = false;
      }
    });
  }

  /**
   * Handle color configuration changes from ColorZoneConfigurator
   */
  onColorConfigChange(updatedConfig: Partial<ProgramConfig>): void {
    // Merge the color changes back into programConfig
    this.programConfig = { ...this.programConfig, ...updatedConfig };
  }

  /**
   * Handle analyze colors request from ColorZoneConfigurator
   * This will be called when user clicks "Analyze & Suggest Colors"
   */
  onAnalyzeColors(websiteUrl: string): void {
    if (!websiteUrl) {
      if (this.colorZoneConfigurator) {
        this.colorZoneConfigurator.setError('Please enter a website URL first');
      }
      return;
    }

    console.log('Starting color analysis for:', websiteUrl);
    this.isCapturingScreenshot = true;

    this.idpService.analyzeColors(websiteUrl).subscribe({
      next: (response) => {
        console.log('Color analysis response:', response);
        this.isCapturingScreenshot = false;

        // Check if analysis was successful
        if (response.success && response.colors && response.colors.length >= 6) {
          console.log('Suggested colors:', response.colors);
          this.programConfig = {
            ...this.programConfig,
            primaryButtonColor: response.colors[0],
            headerBackgroundColor: response.colors[1],
            footerBackgroundColor: response.colors[2],
            primaryColor: response.colors[3],
            secondaryButtonColor: response.colors[4],
            secondaryColor: response.colors[5]
          };
          // Clear any previous error and reset analyzing state
          if (this.colorZoneConfigurator) {
            this.colorZoneConfigurator.clearError();
            this.colorZoneConfigurator.setAnalyzing(false);
          }
        } else {
          // Analysis failed - show error message
          console.warn('Color analysis failed:', response.errorMessage);
          if (this.colorZoneConfigurator) {
            this.colorZoneConfigurator.setError(
              response.errorMessage || 'Unable to extract colors from website. Please try using the Analyze PDF feature instead.'
            );
          }
        }
      },
      error: (error) => {
        console.error('Color analysis failed:', error);
        console.error('Error details:', error.error);
        this.isCapturingScreenshot = false;
        // Show error message in UI
        if (this.colorZoneConfigurator) {
          this.colorZoneConfigurator.setError(
            'Unable to connect to the color analysis service. Please try again or use the Analyze PDF feature.'
          );
        }
      }
    });
  }

  /**
   * Handle PDF color analysis request from ColorZoneConfigurator
   * This will be called when user uploads a PDF and clicks "Analyze PDF"
   */
  onAnalyzePdfColors(file: File): void {
    if (!file) {
      if (this.colorZoneConfigurator) {
        this.colorZoneConfigurator.setError('Please select a PDF file first');
      }
      return;
    }

    console.log('Starting PDF color analysis for:', file.name);

    this.idpService.analyzePdfColors(file).subscribe({
      next: (response) => {
        console.log('PDF color analysis response:', response);

        // Check if analysis was successful
        if (response.success && response.colors && response.colors.length >= 6) {
          console.log('Suggested colors from PDF:', response.colors);
          this.programConfig = {
            ...this.programConfig,
            primaryButtonColor: response.colors[0],
            headerBackgroundColor: response.colors[1],
            footerBackgroundColor: response.colors[2],
            primaryColor: response.colors[3],
            secondaryButtonColor: response.colors[4],
            secondaryColor: response.colors[5]
          };
          // Clear any previous error and reset analyzing state
          if (this.colorZoneConfigurator) {
            this.colorZoneConfigurator.clearError();
            this.colorZoneConfigurator.setAnalyzingPdf(false);
            this.colorZoneConfigurator.clearPdfFile();
          }
        } else {
          // Analysis failed - show error message
          console.warn('PDF color analysis failed:', response.errorMessage);
          if (this.colorZoneConfigurator) {
            this.colorZoneConfigurator.setError(
              response.errorMessage || 'Unable to extract colors from PDF. Please try a different document or manually select colors.'
            );
            this.colorZoneConfigurator.setAnalyzingPdf(false);
          }
        }
      },
      error: (error) => {
        console.error('PDF color analysis failed:', error);
        console.error('Error details:', error.error);
        // Show error message in UI
        if (this.colorZoneConfigurator) {
          this.colorZoneConfigurator.setError(
            'Unable to analyze PDF. Please try again or manually select colors.'
          );
          this.colorZoneConfigurator.setAnalyzingPdf(false);
        }
      }
    });
  }

  /**
   * Open the visual schema editor modal
   */
  openSchemaEditor(): void {
    if (this.generatedSchema) {
      this.showSchemaEditor = true;
    }
  }

  /**
   * Close the visual schema editor modal
   */
  closeSchemaEditor(): void {
    this.showSchemaEditor = false;
  }

  /**
   * Handle save from the schema editor
   * Updates the generatedSchema with the modified JSON
   */
  onSchemaEditorSave(updatedSchema: string): void {
    this.generatedSchema = updatedSchema;
    this.showSchemaEditor = false;
    console.log('Schema updated via visual editor');
  }
}
