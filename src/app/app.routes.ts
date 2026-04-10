import { Routes } from '@angular/router';
import { adminRoleGuard } from './features/auth/guards/admin-role.guard';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';

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
    path: 'directory',
    loadComponent: () =>
      import('./features/contractor-directory/contractor-directory-page.component').then((m) => m.ContractorDirectoryPageComponent)
  },
  {
    path: 'directory/:id',
    loadComponent: () => import('./features/contractor-profile/contractor-profile-page.component').then((m) => m.ContractorProfilePageComponent)
  },
  {
    path: 'help',
    loadComponent: () => import('./features/dashboard/help-page.component').then((m) => m.HelpPageComponent)
  },
  {
    path: 'contractor-directory',
    pathMatch: 'full',
    redirectTo: 'directory'
  },
  {
    path: 'contractor-directory/:id',
    redirectTo: 'directory/:id'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent)
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/forgot-password-page.component').then((m) => m.ForgotPasswordPageComponent)
  },
  {
    path: 'messages',
    canActivate: [authGuard],
    loadComponent: () => import('./features/messages/messages-page.component').then((m) => m.MessagesPageComponent)
  },
  {
    path: 'admin',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-page.component').then((m) => m.AdminPageComponent)
  },
  {
    path: 'admin/providers',
    pathMatch: 'full',
    redirectTo: 'admin/providers/import'
  },
  {
    path: 'admin/providers/import',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-providers-page.component').then((m) => m.AdminProvidersPageComponent)
  },
  {
    path: 'admin/providers/new',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-providers-page.component').then((m) => m.AdminProvidersPageComponent)
  },
  {
    path: 'admin/categories',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-categories-page.component').then((m) => m.AdminCategoriesPageComponent)
  },
  {
    path: 'admin/reviews',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-reviews-page.component').then((m) => m.AdminReviewsPageComponent)
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
