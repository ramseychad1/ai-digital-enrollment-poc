import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Feature {
  title: string;
  description: string;
  icon: string;
  features: string[];
}

@Component({
  selector: 'app-about-features',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-features.component.html',
  styleUrls: ['./about-features.component.scss']
})
export class AboutFeaturesComponent {
  features: Feature[] = [
    {
      title: 'Dynamic Program Management',
      description: 'Centralized configuration via Contentful CMS with automated brand capture using external APIs and real-time updates across all programs.',
      icon: '🎯',
      features: [
        'Multi-tenant Architecture',
        'Auto-Brand Extraction',
        'Real-time Updates'
      ]
    },
    {
      title: 'Intelligent Form Engine',
      description: 'Dynamic form rendering based on JSON schemas with complex validation logic, conditional fields, and responsive layouts for all devices.',
      icon: '📋',
      features: [
        'No Hard-coded Fields',
        'Schema-driven Validation',
        'Responsive Layouts'
      ]
    },
    {
      title: 'AI Form Builder',
      description: 'PDF-to-JSON conversion using Claude Sonnet 4 with intelligent field detection, type inference, PDF color analysis for brand extraction, and side-by-side admin preview.',
      icon: '🤖',
      features: [
        'PDF Analysis',
        'Field Detection',
        'Color Extraction',
        'Visual Editor'
      ]
    },
    {
      title: 'Secure Authentication',
      description: 'Session-based authentication with HTTP-only cookies, 30-minute automatic timeout, branded login interface, and protected admin routes.',
      icon: '🔒',
      features: [
        'Session Management',
        'Auto-timeout',
        'Professional UI',
        'Route Guards'
      ]
    },
    {
      title: 'Cloud Deployment',
      description: 'Railway platform hosting with automatic deployments from GitHub, environment-based configuration, and health monitoring endpoints.',
      icon: '☁️',
      features: [
        'CI/CD Integration',
        'Zero-downtime Deploys',
        'Scalable Infrastructure',
        'Health Monitoring'
      ]
    }
  ];
}
