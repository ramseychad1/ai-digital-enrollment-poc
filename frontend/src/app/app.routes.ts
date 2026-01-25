import { Routes } from '@angular/router';
import { ProgramSelectorComponent } from './components/program-selector/program-selector.component';
import { ProgramLandingComponent } from './components/program-landing/program-landing.component';
import { FormRendererComponent } from './components/form-renderer/form-renderer.component';
import { FormBuilderComponent } from './components/admin/form-builder/form-builder.component';

export const routes: Routes = [
  {
    path: '',
    component: ProgramSelectorComponent
  },
  {
    path: 'enroll/:programId',
    component: ProgramLandingComponent
  },
  {
    path: 'enroll/:programId/form',
    component: FormRendererComponent
  },
  {
    path: 'admin/form-builder',
    component: FormBuilderComponent
  },
  {
    path: 'admin/form-builder/edit/:programId',
    component: FormBuilderComponent
  },
  {
    path: 'admin/form-builder/edit-pdf/:programId',
    component: FormBuilderComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
