import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ColorPickerModule } from 'ngx-color-picker';
import { ProgramConfig } from '../../../models/idp.model';

/**
 * Color Zone Interface
 * Maps visual zones in the preview to Contentful programConfig fields
 */
export interface ColorZone {
  id: string;
  label: string;           // Full descriptive label (e.g., "Primary Action Button")
  displayName: string;     // Short display name (e.g., "Primary Button")
  contentfulField: keyof ProgramConfig;  // Maps to programConfig property
  color: string;
  aiSuggested: boolean;
}

/**
 * AI Color Suggestion Interface
 * Received from parent after AI analysis
 */
export interface ColorSuggestion {
  colors: string[];
  screenshotBase64?: string;
}

/**
 * ColorZoneConfiguratorComponent
 *
 * A visual color configuration tool that displays an interactive preview
 * of how colors apply to different zones of the enrollment form.
 *
 * Replaces the traditional 6 separate color input fields with an intuitive
 * visual interface where users can click zones to change colors.
 *
 * Contentful Field Mappings:
 * - headerBackgroundColor: Header zone background
 * - primaryButtonColor: Primary action buttons
 * - secondaryButtonColor: Secondary/cancel buttons
 * - secondaryColor: Sidebar/navigation background
 * - primaryColor: Main content accent color
 * - footerBackgroundColor: Footer zone background
 */
@Component({
  selector: 'app-color-zone-configurator',
  standalone: true,
  imports: [CommonModule, FormsModule, ColorPickerModule],
  templateUrl: './color-zone-configurator.component.html',
  styleUrls: ['./color-zone-configurator.component.scss']
})
export class ColorZoneConfiguratorComponent implements OnInit, OnChanges {

  /** Website URL for AI color analysis */
  @Input() websiteUrl: string = '';

  /** Current program configuration state */
  @Input() programConfig: Partial<ProgramConfig> = {};

  /** Emits updated programConfig when colors change */
  @Output() configChange = new EventEmitter<Partial<ProgramConfig>>();

  /** Emits websiteUrl when user clicks "Analyze & Suggest Colors" */
  @Output() analyzeRequest = new EventEmitter<string>();

  /** Emits PDF file when user uploads for color analysis */
  @Output() analyzePdfRequest = new EventEmitter<File>();

  /** Loading state for analyze button */
  isAnalyzing: boolean = false;

  /** Loading state for PDF analysis */
  isAnalyzingPdf: boolean = false;

  /** Selected PDF file for color analysis */
  selectedPdfFile: File | null = null;

  /** Currently selected zone for color picker */
  selectedZoneId: string | null = null;

  /** AI suggested colors from analysis */
  suggestedColors: string[] = [];

  /** Error message to display below URL input */
  errorMessage: string | null = null;

  /**
   * Zone definitions with Contentful field mappings
   * Each zone represents a visual area in the enrollment form preview
   */
  zones: ColorZone[] = [
    {
      id: 'header',
      label: 'Header Background',
      displayName: 'Header',
      contentfulField: 'headerBackgroundColor',
      color: '#000000',
      aiSuggested: false
    },
    {
      id: 'primary-button',
      label: 'Primary Action Button',
      displayName: 'Primary Button',
      contentfulField: 'primaryButtonColor',
      color: '#E41F35',
      aiSuggested: false
    },
    {
      id: 'secondary-button',
      label: 'Secondary Button',
      displayName: 'Secondary Button',
      contentfulField: 'secondaryButtonColor',
      color: '#666666',
      aiSuggested: false
    },
    {
      id: 'sidebar',
      label: 'Sidebar/Navigation',
      displayName: 'Sidebar',
      contentfulField: 'secondaryColor',
      color: '#333333',
      aiSuggested: false
    },
    {
      id: 'body',
      label: 'Main Content Accent',
      displayName: 'Accent',
      contentfulField: 'primaryColor',
      color: '#E41F35',
      aiSuggested: false
    },
    {
      id: 'form-background',
      label: 'Form Background',
      displayName: 'Form Background',
      contentfulField: 'formBackgroundColor',
      color: '#FFFFFF',
      aiSuggested: false
    },
    {
      id: 'footer',
      label: 'Footer Background',
      displayName: 'Footer',
      contentfulField: 'footerBackgroundColor',
      color: '#000000',
      aiSuggested: false
    }
  ];

  ngOnInit(): void {
    this.syncZonesFromConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['programConfig'] && !changes['programConfig'].firstChange) {
      this.syncZonesFromConfig();
    }
  }

  /**
   * Sync zone colors from programConfig input
   */
  private syncZonesFromConfig(): void {
    if (!this.programConfig) return;

    this.zones.forEach(zone => {
      const configValue = this.programConfig[zone.contentfulField];
      if (configValue && typeof configValue === 'string') {
        zone.color = configValue;
      }
    });
  }

  /**
   * Calculate contrasting text color for readability
   * @param hexColor - Background color in hex format
   * @returns '#000000' for light backgrounds, '#FFFFFF' for dark backgrounds
   */
  getContrastColor(hexColor: string): string {
    if (!hexColor) return '#000000';

    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Handle zone click - opens color picker for that zone
   * @param zoneId - The ID of the clicked zone
   */
  onZoneClick(zoneId: string): void {
    this.selectedZoneId = this.selectedZoneId === zoneId ? null : zoneId;
  }

  /**
   * Get zone by ID
   */
  getZone(zoneId: string): ColorZone | undefined {
    return this.zones.find(z => z.id === zoneId);
  }

  /**
   * Handle color change from color picker
   * @param zoneId - The ID of the zone being changed
   * @param newColor - The new color value in hex format
   */
  onColorChange(zoneId: string, newColor: string): void {
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return;

    // Update zone color
    zone.color = newColor;
    zone.aiSuggested = false; // User override clears AI suggestion

    // Update programConfig and emit change
    const updatedConfig = { ...this.programConfig };
    (updatedConfig as any)[zone.contentfulField] = newColor;

    this.configChange.emit(updatedConfig);
  }

  /**
   * Trigger AI color analysis
   */
  onAnalyze(): void {
    if (!this.websiteUrl) return;

    this.isAnalyzing = true;
    this.errorMessage = null; // Clear any previous error
    this.analyzeRequest.emit(this.websiteUrl);
  }

  /**
   * Set analyzing state (called by parent when analysis completes)
   */
  setAnalyzing(analyzing: boolean): void {
    this.isAnalyzing = analyzing;
  }

  /**
   * Set error message (called by parent when analysis fails)
   */
  setError(message: string | null): void {
    this.errorMessage = message;
    this.isAnalyzing = false;
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorMessage = null;
  }

  /**
   * Handle PDF file selection for color analysis
   */
  onPdfFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/pdf') {
        this.selectedPdfFile = file;
        this.errorMessage = null;
      } else {
        this.errorMessage = 'Please select a valid PDF file';
        this.selectedPdfFile = null;
      }
    }
  }

  /**
   * Trigger PDF color analysis
   */
  onAnalyzePdf(): void {
    if (!this.selectedPdfFile) {
      this.errorMessage = 'Please select a PDF file first';
      return;
    }

    this.isAnalyzingPdf = true;
    this.errorMessage = null;
    this.analyzePdfRequest.emit(this.selectedPdfFile);
  }

  /**
   * Set PDF analyzing state (called by parent)
   */
  setAnalyzingPdf(analyzing: boolean): void {
    this.isAnalyzingPdf = analyzing;
  }

  /**
   * Clear selected PDF file
   */
  clearPdfFile(): void {
    this.selectedPdfFile = null;
  }

  /**
   * Apply AI color suggestions to zones
   * Called by parent component after AI analysis returns results
   * @param suggestions - Color suggestions from AI analysis
   */
  applySuggestions(suggestions: ColorSuggestion): void {
    this.isAnalyzing = false;

    if (!suggestions?.colors || suggestions.colors.length === 0) {
      return;
    }

    this.suggestedColors = suggestions.colors;

    // Auto-apply first few colors to key zones if available
    const colorMapping = [
      { zoneId: 'primary-button', colorIndex: 0 },
      { zoneId: 'header', colorIndex: 1 },
      { zoneId: 'footer', colorIndex: 1 },
      { zoneId: 'body', colorIndex: 0 },
      { zoneId: 'secondary-button', colorIndex: 2 },
      { zoneId: 'sidebar', colorIndex: 3 }
    ];

    const updatedConfig = { ...this.programConfig };

    colorMapping.forEach(mapping => {
      if (suggestions.colors[mapping.colorIndex]) {
        const zone = this.zones.find(z => z.id === mapping.zoneId);
        if (zone) {
          zone.color = suggestions.colors[mapping.colorIndex];
          zone.aiSuggested = true;
          (updatedConfig as any)[zone.contentfulField] = zone.color;
        }
      }
    });

    this.configChange.emit(updatedConfig);
  }

  /**
   * Apply a specific suggested color to a zone
   * @param zoneId - Target zone ID
   * @param color - Color to apply
   */
  applySuggestedColor(zoneId: string, color: string): void {
    const zone = this.zones.find(z => z.id === zoneId);
    if (!zone) return;

    zone.color = color;
    zone.aiSuggested = true;

    const updatedConfig = { ...this.programConfig };
    (updatedConfig as any)[zone.contentfulField] = color;

    this.configChange.emit(updatedConfig);
  }

  /**
   * Clear AI suggestion badge from a zone
   */
  clearAiSuggestion(zoneId: string): void {
    const zone = this.zones.find(z => z.id === zoneId);
    if (zone) {
      zone.aiSuggested = false;
    }
  }

  /**
   * Reset all zones to default colors
   */
  resetToDefaults(): void {
    const defaults: Record<string, string> = {
      'header': '#000000',
      'primary-button': '#E41F35',
      'secondary-button': '#666666',
      'sidebar': '#333333',
      'body': '#E41F35',
      'form-background': '#FFFFFF',
      'footer': '#000000'
    };

    const updatedConfig = { ...this.programConfig };

    this.zones.forEach(zone => {
      zone.color = defaults[zone.id] || '#000000';
      zone.aiSuggested = false;
      (updatedConfig as any)[zone.contentfulField] = zone.color;
    });

    this.configChange.emit(updatedConfig);
  }
}
