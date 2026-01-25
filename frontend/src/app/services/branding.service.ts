import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Program } from '../models/program.model';

export interface Branding {
  primaryColor: string;
  primaryButtonColor: string;
  secondaryColor: string;
  secondaryButtonColor: string;
  headerBackgroundColor: string;
  footerBackgroundColor: string;
  formBackgroundColor: string;
  footerText: string;
  companyName: string;
  logoUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class BrandingService {
  // Default CMR Services branding
  private defaultBranding: Branding = {
    primaryColor: '#E41F35',
    primaryButtonColor: '#E41F35',
    secondaryColor: '#000000',
    secondaryButtonColor: '#666666',
    headerBackgroundColor: '#000000',
    footerBackgroundColor: '#000000',
    formBackgroundColor: '#FFFFFF',
    footerText: '© 2026 CMR Services. All rights reserved.',
    companyName: 'CMR Services'
  };

  private currentBranding = new BehaviorSubject<Branding>(this.defaultBranding);
  public branding$ = this.currentBranding.asObservable();

  applyProgramBranding(program: Program): void {
    const branding: Branding = {
      primaryColor: program.primaryColor || this.defaultBranding.primaryColor,
      primaryButtonColor: program.primaryButtonColor || program.primaryColor || this.defaultBranding.primaryButtonColor,
      secondaryColor: program.secondaryColor || this.defaultBranding.secondaryColor,
      secondaryButtonColor: program.secondaryButtonColor || this.defaultBranding.secondaryButtonColor,
      headerBackgroundColor: program.headerBackgroundColor || this.defaultBranding.headerBackgroundColor,
      footerBackgroundColor: program.footerBackgroundColor || this.defaultBranding.footerBackgroundColor,
      formBackgroundColor: program.formBackgroundColor || this.defaultBranding.formBackgroundColor,
      footerText: program.footerText || this.defaultBranding.footerText,
      companyName: program.companyName || program.displayName,
      logoUrl: program.logoUrl
    };

    this.currentBranding.next(branding);
    this.applyCSSVariables(branding);
  }

  resetToDefault(): void {
    this.currentBranding.next(this.defaultBranding);
    this.applyCSSVariables(this.defaultBranding);
  }

  private applyCSSVariables(branding: Branding): void {
    document.documentElement.style.setProperty('--primary-color', branding.primaryColor);
    document.documentElement.style.setProperty('--primary-button-color', branding.primaryButtonColor);
    document.documentElement.style.setProperty('--secondary-color', branding.secondaryColor);
    document.documentElement.style.setProperty('--secondary-button-color', branding.secondaryButtonColor);
    document.documentElement.style.setProperty('--header-bg-color', branding.headerBackgroundColor);
    document.documentElement.style.setProperty('--footer-bg-color', branding.footerBackgroundColor);
    document.documentElement.style.setProperty('--form-bg-color', branding.formBackgroundColor);
  }
}
