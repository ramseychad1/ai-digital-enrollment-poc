import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrandingService, Branding } from '../../../services/branding.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent implements OnInit {
  branding!: Branding;

  constructor(private brandingService: BrandingService) {}

  ngOnInit(): void {
    this.brandingService.branding$.subscribe(branding => {
      this.branding = branding;
    });
  }
}
