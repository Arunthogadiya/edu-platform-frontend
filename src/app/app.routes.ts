import { Routes } from '@angular/router';
import { authRoutes } from './modules/auth/auth-routing';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    children: authRoutes
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./modules/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  }
];
