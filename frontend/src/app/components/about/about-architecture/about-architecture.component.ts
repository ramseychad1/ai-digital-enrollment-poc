import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about-architecture',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-architecture.component.html',
  styleUrls: ['./about-architecture.component.scss']
})
export class AboutArchitectureComponent {
  clientLayer = [
    { name: 'Patient', role: 'Accesses Public Portal' },
    { name: 'Admin', role: 'Uploads PDF Forms, Secured Login' },
    { name: 'Playwright', role: 'Automated Tester' }
  ];

  applicationCore = [
    {
      name: 'Angular Frontend',
      description: 'Dynamic Rendering Engine',
      tech: 'Angular 17, TypeScript, SCSS'
    },
    {
      name: 'Spring Boot API',
      description: 'Orchestration & Logic, Session Management',
      tech: 'Java 17, Spring Security, JPA'
    }
  ];

  servicesData = [
    { name: 'Supabase', purpose: 'Submission Storage', icon: '💾' },
    { name: 'Contentful', purpose: 'Program Configuration', icon: '📝' },
    { name: 'Claude AI', purpose: 'Form & Color Analysis', icon: '🤖' },
    { name: 'Logo.dev', purpose: 'Asset Capture', icon: '🎨' },
    { name: 'ScreenshotOne', purpose: 'Website Analysis', icon: '📸' },
    { name: 'Railway', purpose: 'Cloud Hosting', icon: '☁️' }
  ];
}
