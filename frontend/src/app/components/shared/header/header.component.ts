import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { BrandingService, Branding } from '../../../services/branding.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  @Input() programName?: string;
  @Input() showNav: boolean = true;
  branding!: Branding;
  isAuthenticated = false;
  isLoggingOut = false;

  constructor(
    private brandingService: BrandingService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.brandingService.branding$.subscribe(branding => {
      this.branding = branding;
    });

    // Subscribe to authentication status
    this.authService.authenticated$.subscribe(authenticated => {
      this.isAuthenticated = authenticated;
    });

    // Check initial authentication status
    this.authService.checkAuthStatus().subscribe();
  }

  logout(): void {
    this.isLoggingOut = true;
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
        this.isLoggingOut = false;
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.router.navigate(['/login']);
        this.isLoggingOut = false;
      }
    });
  }
}
