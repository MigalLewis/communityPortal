import { Routes } from '@angular/router';
import { activeUserGuard, contractorGuard, residentOrPaidResidentGuard } from './features/auth/guards/access.guards';
import { adminRoleGuard } from './features/auth/guards/admin-role.guard';
import { approvedContractorGuard } from './features/auth/guards/approved-contractor.guard';
import { authGuard } from './features/auth/guards/auth.guard';
import { guestGuard } from './features/auth/guards/guest.guard';

/** Contractor directory and account application routes. */
export const WEBAPP_PAGE_ROUTES: Routes = [
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent) },
  { path: 'directory', loadComponent: () => import('./features/contractor-directory/contractor-directory-page.component').then((m) => m.ContractorDirectoryPageComponent) },
  { path: 'directory/:id', loadComponent: () => import('./features/contractor-profile/contractor-profile-page.component').then((m) => m.ContractorProfilePageComponent) },
  { path: 'contractor-directory', pathMatch: 'full', redirectTo: 'directory' },
  { path: 'contractor-directory/:id', redirectTo: 'directory/:id' },
  { path: 'login', canActivate: [guestGuard], loadComponent: () => import('./features/auth/pages/login-page.component').then((m) => m.LoginPageComponent) },
  { path: 'register', canActivate: [guestGuard], loadComponent: () => import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent) },
  ...(['resident', 'paid-resident', 'contractor'] as const).map((accountType) => ({
    path: `register/${accountType}`,
    canActivate: [guestGuard],
    data: { accountType },
    loadComponent: () => import('./features/auth/pages/register-page.component').then((m) => m.RegisterPageComponent)
  })),
  { path: 'forgot-password', canActivate: [guestGuard], loadComponent: () => import('./features/auth/pages/forgot-password-page.component').then((m) => m.ForgotPasswordPageComponent) },
  ...(['pending', 'rejected', 'deactivated', 'profile-unavailable'] as const).map((status) => ({
    path: `account/${status}`,
    loadComponent: () => import('./features/auth/pages/account-status-page.component').then((m) => m.AccountStatusPageComponent)
  })),
  { path: 'messages', canActivate: [authGuard], loadComponent: () => import('./features/messages/messages-page.component').then((m) => m.MessagesPageComponent) },
  {
    path: 'admin',
    canActivate: [adminRoleGuard],
    canActivateChild: [adminRoleGuard],
    loadComponent: () => import('./features/admin/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', loadComponent: () => import('./features/admin/admin-page.component').then((m) => m.AdminPageComponent) },
      { path: 'users', loadComponent: () => import('./features/admin/admin-users-page.component').then((m) => m.AdminUsersPageComponent) },
      { path: 'providers', loadComponent: () => import('./features/admin/admin-providers-page.component').then((m) => m.AdminProvidersPageComponent) },
      { path: 'providers/import', pathMatch: 'full', redirectTo: 'providers' },
      { path: 'providers/new', pathMatch: 'full', redirectTo: 'providers' },
      { path: 'categories', loadComponent: () => import('./features/admin/admin-categories-page.component').then((m) => m.AdminCategoriesPageComponent) },
      { path: 'reviews', loadComponent: () => import('./features/admin/admin-reviews-page.component').then((m) => m.AdminReviewsPageComponent) },
      { path: 'municipal-reports', loadComponent: () => import('./features/admin/admin-municipal-reports-page.component').then((m) => m.AdminMunicipalReportsPageComponent) },
      { path: 'adverts', loadComponent: () => import('./features/admin/adverts/admin-adverts-page.component').then((m) => m.AdminAdvertsPageComponent) },
      { path: 'adverts/new', loadComponent: () => import('./features/admin/adverts/advert-editor.component').then((m) => m.AdvertEditorComponent) },
      { path: 'adverts/:id/edit', loadComponent: () => import('./features/admin/adverts/advert-editor.component').then((m) => m.AdvertEditorComponent) },
      { path: 'events', loadComponent: () => import('./features/admin/events/admin-events-page.component').then((m) => m.AdminEventsPageComponent) },
      { path: 'resources', loadComponent: () => import('./features/admin/resources/admin-resources-page.component').then((m) => m.AdminResourcesPageComponent) },
      { path: 'events/new', loadComponent: () => import('./features/admin/events/event-editor.component').then((m) => m.EventEditorComponent) },
      { path: 'events/:id/edit', loadComponent: () => import('./features/admin/events/event-editor.component').then((m) => m.EventEditorComponent) },
      { path: 'projects', loadComponent: () => import('./features/admin/projects/admin-projects-page.component').then((m) => m.AdminProjectsPageComponent) },
      { path: 'projects/new', loadComponent: () => import('./features/admin/projects/community-project-editor.component').then((m) => m.CommunityProjectEditorComponent) },
      { path: 'projects/:id/edit', loadComponent: () => import('./features/admin/projects/community-project-editor.component').then((m) => m.CommunityProjectEditorComponent) },
      { path: 'committee', loadComponent: () => import('./features/admin/committee/admin-committee-page.component').then(m => m.AdminCommitteePageComponent) },
      { path: 'committee/new', loadComponent: () => import('./features/admin/committee/committee-member-editor.component').then(m => m.CommitteeMemberEditorComponent) },
      { path: 'committee/:id/edit', loadComponent: () => import('./features/admin/committee/committee-member-editor.component').then(m => m.CommitteeMemberEditorComponent) },
      { path: 'portfolios', loadComponent: () => import('./features/admin/portfolios/admin-portfolios-page.component').then(m => m.AdminPortfoliosPageComponent) },
      { path: 'portfolios/new', loadComponent: () => import('./features/admin/portfolios/portfolio-editor.component').then(m => m.PortfolioEditorComponent) },
      { path: 'portfolios/:id/edit', loadComponent: () => import('./features/admin/portfolios/portfolio-editor.component').then(m => m.PortfolioEditorComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent) }
    ]
  },
  { path: 'projects', canActivate: [residentOrPaidResidentGuard], loadComponent: () => import('./features/projects/projects-page.component').then((m) => m.ProjectsPageComponent) },
  { path: 'contractor/profile/edit', canActivate: [contractorGuard, approvedContractorGuard], loadComponent: () => import('./features/contractor-profile/contractor-profile-edit.component').then((m) => m.ContractorProfileEditComponent) },
  { path: 'work-orders', canActivate: [contractorGuard], loadComponent: () => import('./features/work-orders/work-orders-page.component').then((m) => m.WorkOrdersPageComponent) },
  { path: 'settings', canActivate: [activeUserGuard], loadComponent: () => import('./features/settings/settings-page.component').then((m) => m.SettingsPageComponent) }
];

export const WEBAPP_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../core/layout/app-shell/app-shell.component').then((m) => m.AppShellComponent),
    children: WEBAPP_PAGE_ROUTES
  }
];
