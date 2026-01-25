import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  JsonSchemaResponse,
  ColorSuggestion,
  LogoResponse,
  ProgramConfig,
  PublishResponse
} from '../models/idp.model';
import { environment } from '../../environments/environment';

export interface ColorAnalysisResponse {
  colors?: string[];
  screenshotBase64?: string;
  reasoning?: string;
  success: boolean;
  errorMessage?: string;
  websiteBlocked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class IdpService {
  private apiUrl = `${environment.apiUrl}/idp`;

  constructor(private http: HttpClient) {}

  analyzePdf(file: File): Observable<JsonSchemaResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<JsonSchemaResponse>(`${this.apiUrl}/analyze-pdf`, formData);
  }

  captureScreenshot(url: string): Observable<ColorSuggestion> {
    return this.http.post<ColorSuggestion>(`${this.apiUrl}/capture-screenshot`, { url });
  }

  fetchLogo(url: string): Observable<LogoResponse> {
    return this.http.post<LogoResponse>(`${this.apiUrl}/fetch-logo`, { url });
  }

  publishToContentful(config: ProgramConfig): Observable<PublishResponse> {
    return this.http.post<PublishResponse>(`${this.apiUrl}/publish-to-contentful`, config);
  }

  updateProgram(programId: string, updateData: any): Observable<PublishResponse> {
    return this.http.put<PublishResponse>(`${this.apiUrl}/update-program/${programId}`, updateData);
  }

  updateProgramWithSchema(programId: string, updateData: any): Observable<PublishResponse> {
    return this.http.put<PublishResponse>(`${this.apiUrl}/update-program-with-schema/${programId}`, updateData);
  }

  analyzeColors(websiteUrl: string): Observable<ColorAnalysisResponse> {
    return this.http.post<ColorAnalysisResponse>(`${this.apiUrl}/analyze-colors`, { websiteUrl });
  }

  /**
   * Analyze colors from a PDF document using Claude Vision
   * @param file The PDF file to analyze
   * @returns Observable with color analysis results
   */
  analyzePdfColors(file: File): Observable<ColorAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ColorAnalysisResponse>(`${this.apiUrl}/analyze-pdf-colors`, formData);
  }
}
