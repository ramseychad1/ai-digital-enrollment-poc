import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormSchema } from '../models/form-schema.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetches a form schema by form ID from the backend.
   * @param formId - The form identifier
   * @returns Observable of FormSchema
   */
  getFormSchema(formId: string): Observable<FormSchema> {
    return this.http.get<FormSchema>(`${this.apiUrl}/forms/${formId}`);
  }
}
