import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Program } from '../models/program.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Fetches all active enrollment programs from the backend.
   * @returns Observable of Program array
   */
  getAllPrograms(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/programs`);
  }

  /**
   * Fetches a specific program by ID.
   * @param programId - The program identifier
   * @returns Observable of Program
   */
  getProgramById(programId: string): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/programs/${programId}`);
  }

  /**
   * Deletes a program by ID.
   * @param programId - The program identifier
   * @returns Observable of void
   */
  deleteProgram(programId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/programs/${programId}`);
  }
}
