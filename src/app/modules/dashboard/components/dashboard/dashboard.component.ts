import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="p-4">
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  `,
  styles: [`
    h1 {
      color: #111827;
      font-size: 1.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
  `]
})
export class DashboardComponent {}