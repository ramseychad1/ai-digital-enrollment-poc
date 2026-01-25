import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BrandingService, Branding } from '../../../services/branding.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  branding!: Branding;

  constructor(private brandingService: BrandingService) {}

  ngOnInit(): void {
    this.brandingService.branding$.subscribe(branding => {
      this.branding = branding;
    });
  }
}
