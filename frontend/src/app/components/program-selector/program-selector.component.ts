import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable, catchError, of, interval, Subscription } from 'rxjs';
import { Program } from '../../models/program.model';
import { ProgramService } from '../../services/program.service';
import { BrandingService } from '../../services/branding.service';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-program-selector',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './program-selector.component.html',
  styleUrl: './program-selector.component.scss'
})
export class ProgramSelectorComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;

  // Delete confirmation state
  showDeleteConfirm: boolean = false;
  programToDelete: Program | null = null;
  isDeleting: boolean = false;

  // Session check interval (5 minutes)
  private sessionCheckInterval?: Subscription;

  constructor(
    private programService: ProgramService,
    private brandingService: BrandingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Reset to CMR Services default branding
    this.brandingService.resetToDefault();
    this.loadPrograms();

    // Check session status every 5 minutes
    // This helps detect expired sessions even without user interaction
    this.sessionCheckInterval = interval(5 * 60 * 1000).subscribe(() => {
      this.authService.checkAuthStatus().subscribe({
        error: () => {
          // Session check failed - likely expired, will be handled by interceptor
          console.warn('Session check failed - redirecting to login');
        }
      });
    });
  }

  ngOnDestroy(): void {
    // Clean up session check interval
    if (this.sessionCheckInterval) {
      this.sessionCheckInterval.unsubscribe();
    }
  }

  loadPrograms(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.programService.getAllPrograms().pipe(
      catchError((error) => {
        console.error('Failed to fetch programs', error);
        this.errorMessage = 'Unable to load programs. Please try again later.';
        this.isLoading = false;
        return of([]);
      })
    ).subscribe((programs) => {
      this.programs = programs;
      this.isLoading = false;
    });
  }

  selectProgram(programId: string): void {
    // Open in new tab
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/enroll', programId])
    );
    window.open(url, '_blank');
  }

  editProgram(programId: string): void {
    this.router.navigate(['/admin/form-builder/edit', programId]);
  }

  editProgramWithPdf(programId: string): void {
    this.router.navigate(['/admin/form-builder/edit-pdf', programId]);
  }

  confirmDelete(program: Program): void {
    this.programToDelete = program;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.programToDelete = null;
  }

  deleteProgram(): void {
    if (!this.programToDelete) return;

    this.isDeleting = true;
    this.programService.deleteProgram(this.programToDelete.programId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteConfirm = false;
        this.programToDelete = null;
        // Reload programs list
        this.loadPrograms();
      },
      error: (error) => {
        console.error('Error deleting program', error);
        this.isDeleting = false;
        alert('Failed to delete program. Please try again.');
      }
    });
  }
}
