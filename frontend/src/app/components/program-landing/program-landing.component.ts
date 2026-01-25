import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';
import { Program } from '../../models/program.model';
import { ProgramService } from '../../services/program.service';
import { BrandingService } from '../../services/branding.service';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-program-landing',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent],
  templateUrl: './program-landing.component.html',
  styleUrl: './program-landing.component.scss'
})
export class ProgramLandingComponent implements OnInit {
  program$!: Observable<Program>;
  program?: Program;
  programId!: string;
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private programService: ProgramService,
    private brandingService: BrandingService
  ) {}

  ngOnInit(): void {
    this.programId = this.route.snapshot.paramMap.get('programId') || '';
    if (this.programId) {
      this.loadProgram();
    } else {
      this.errorMessage = 'Program ID not found';
      this.isLoading = false;
    }
  }

  loadProgram(): void {
    this.isLoading = true;
    this.program$ = this.programService.getProgramById(this.programId).pipe(
      catchError((error) => {
        console.error('Failed to fetch program', error);
        this.errorMessage = 'Unable to load program details. Please try again later.';
        this.isLoading = false;
        return of({} as Program);
      })
    );

    this.program$.subscribe((program) => {
      this.program = program;
      // Apply program branding
      this.brandingService.applyProgramBranding(program);
      this.isLoading = false;
    });
  }

  startEnrollment(): void {
    this.router.navigate(['/enroll', this.programId, 'form']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
