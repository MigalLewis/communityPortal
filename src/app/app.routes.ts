import { Routes } from '@angular/router';
import { adminRoleGuard } from './features/auth/guards/admin-role.guard';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';
import { activeUserGuard, contractorGuard, residentOrPaidResidentGuard } from './features/auth/guards/access.guards';
import { approvedContractorGuard } from './features/auth/guards/approved-contractor.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/landing/landing-page.component').then((m) => m.LandingPageComponent)
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
  ...(['resident', 'paid-resident', 'contractor'] as const).map((accountType) => ({
    path: `register/${accountType}`,
    canActivate: [guestGuard],
    data: { accountType },
    loadComponent: () => import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent)
  })),
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/pages/forgot-password-page.component').then((m) => m.ForgotPasswordPageComponent)
  },
  ...(['pending', 'rejected', 'deactivated'] as const).map((status) => ({
    path: `account/${status}`,
    loadComponent: () => import('./features/auth/pages/account-status-page.component').then((m) => m.AccountStatusPageComponent)
  })),
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
    path: 'admin/users',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-users-page.component').then((m) => m.AdminUsersPageComponent)
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
    path: 'admin/adverts',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/adverts/admin-adverts-page.component').then((m) => m.AdminAdvertsPageComponent)
  },
  {
    path: 'admin/adverts/new',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/adverts/advert-editor.component').then((m) => m.AdvertEditorComponent)
  },
  {
    path: 'admin/adverts/:id/edit',
    canActivate: [adminRoleGuard],
    loadComponent: () => import('./features/admin/adverts/advert-editor.component').then((m) => m.AdvertEditorComponent)
  },
  {
    path: 'projects',
    canActivate: [residentOrPaidResidentGuard],
    loadComponent: () => import('./features/projects/projects-page.component').then((m) => m.ProjectsPageComponent)
  },
  {
    path: 'contractor/profile/edit',
    canActivate: [contractorGuard, approvedContractorGuard],
    loadComponent: () => import('./features/contractor-profile/contractor-profile-edit.component').then((m) => m.ContractorProfileEditComponent)
  },
  {
    path: 'work-orders',
    canActivate: [contractorGuard],
    loadComponent: () => import('./features/work-orders/work-orders-page.component').then((m) => m.WorkOrdersPageComponent)
  },
  {
    path: 'settings',
    canActivate: [activeUserGuard],
    loadComponent: () => import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
