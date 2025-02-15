import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: 'role-select',
    pathMatch: 'full'
  },
  {
    path: 'role-select',
    loadComponent: () => import('./components/role-selection/role-selection.component').then(m => m.RoleSelectionComponent)
  },
  {
    path: 'parent-login',
    loadComponent: () => import('./components/parent-login/parent-login.component').then(m => m.ParentLoginComponent)
  },
  {
    path: 'teacher-login',
    loadComponent: () => import('./components/teacher-login/teacher-login.component').then(m => m.TeacherLoginComponent)
  }
];