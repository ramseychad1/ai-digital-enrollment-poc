import { Routes } from '@angular/router';
import { ProgramSelectorComponent } from './components/program-selector/program-selector.component';
import { ProgramLandingComponent } from './components/program-landing/program-landing.component';
import { FormRendererComponent } from './components/form-renderer/form-renderer.component';
import { FormBuilderComponent } from './components/admin/form-builder/form-builder.component';
import { LoginComponent } from './components/auth/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: ProgramSelectorComponent,
    canActivate: [authGuard]
  },
  {
    path: 'enroll/:programId',
    component: ProgramLandingComponent,
    canActivate: [authGuard]
  },
  {
    path: 'enroll/:programId/form',
    component: FormRendererComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/form-builder',
    component: FormBuilderComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/form-builder/edit/:programId',
    component: FormBuilderComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/form-builder/edit-pdf/:programId',
    component: FormBuilderComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
