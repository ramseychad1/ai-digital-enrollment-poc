import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Technology {
  name: string;
  description: string;
}

interface TechStack {
  category: string;
  icon: string;
  technologies: Technology[];
}

@Component({
  selector: 'app-about-technology',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-technology.component.html',
  styleUrls: ['./about-technology.component.scss']
})
export class AboutTechnologyComponent {
  techStacks: TechStack[] = [
    {
      category: 'Frontend',
      icon: '🎨',
      technologies: [
        { name: 'Angular 17', description: 'Core Framework' },
        { name: 'TypeScript 5.4', description: 'Language' },
        { name: 'SCSS', description: 'Styling' },
        { name: 'RxJS 7.8', description: 'Reactive Programming' },
        { name: 'Express 4.18', description: 'Production Server' }
      ]
    },
    {
      category: 'Backend API',
      icon: '⚙️',
      technologies: [
        { name: 'Spring Boot 3.2', description: 'REST API' },
        { name: 'Java 17', description: 'Language' },
        { name: 'Spring Security', description: 'Authentication' },
        { name: 'Apache PDFBox', description: 'PDF Processing' },
        { name: 'Maven', description: 'Build Tool' }
      ]
    },
    {
      category: 'Data & Content',
      icon: '💾',
      technologies: [
        { name: 'Supabase', description: 'PostgreSQL Database' },
        { name: 'Contentful', description: 'Headless CMS' }
      ]
    },
    {
      category: 'AI & Services',
      icon: '🤖',
      technologies: [
        { name: 'Claude Sonnet 4', description: 'Form & Color Analysis' },
        { name: 'Logo.dev', description: 'Logo Capture' },
        { name: 'ScreenshotOne', description: 'Website Analysis' }
      ]
    },
    {
      category: 'Deployment & Testing',
      icon: '🚀',
      technologies: [
        { name: 'Railway', description: 'Cloud Platform' },
        { name: 'GitHub', description: 'Version Control' },
        { name: 'Playwright', description: 'E2E Automation' }
      ]
    }
  ];
}
