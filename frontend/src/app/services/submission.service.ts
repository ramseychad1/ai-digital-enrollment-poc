import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Submission, SubmissionResponse } from '../models/submission.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Submits a form to the backend.
   * @param submission - The submission data
   * @returns Observable of SubmissionResponse
   */
  submitForm(submission: Submission): Observable<SubmissionResponse> {
    return this.http.post<SubmissionResponse>(`${this.apiUrl}/submissions`, submission);
  }
}
