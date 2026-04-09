import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent)
  },
  {
    path: 'projects',
    loadComponent: () => import('./features/projects/projects-page.component').then((m) => m.ProjectsPageComponent)
  },
  {
    path: 'work-orders',
    loadComponent: () => import('./features/work-orders/work-orders-page.component').then((m) => m.WorkOrdersPageComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
