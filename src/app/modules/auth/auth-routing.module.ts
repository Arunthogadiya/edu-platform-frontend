import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleSelectionComponent } from './components/role-selection/role-selection.component';
import { ParentLoginComponent } from './components/parent-login/parent-login.component';
import { TeacherLoginComponent } from './components/teacher-login/teacher-login.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'role-select',
    pathMatch: 'full'
  },
  {
    path: 'role-select',
    component: RoleSelectionComponent
  },
  {
    path: 'parent-login',
    component: ParentLoginComponent
  },
  {
    path: 'teacher-login',
    component: TeacherLoginComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }