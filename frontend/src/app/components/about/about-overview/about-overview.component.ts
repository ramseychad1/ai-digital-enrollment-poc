import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-overview.component.html',
  styleUrls: ['./about-overview.component.scss']
})
export class AboutOverviewComponent {
  stats = [
    { value: '1 Codebase', label: '∞ Programs' },
    { value: '100%', label: 'Dynamic Forms' },
    { value: 'Claude AI', label: 'Powered' }
  ];

  badges = [
    'Multi-Tenant',
    'AI-Powered',
    'Cloud Native',
    'Secure Auth'
  ];
}
