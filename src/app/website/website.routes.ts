import { Routes } from '@angular/router';

/** Public website pages that do not require account features. */
const WEBSITE_PAGE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing-page.component').then((m) => m.LandingPageComponent)
  },
  {
    path: 'our-community',
    loadComponent: () =>
      import('./features/our-community/our-community-page.component').then(
        (m) => m.OurCommunityPageComponent
      )
  },
  {
    path: 'membership',
    title: 'Join PNRA | Parktown North Residents Association',
    loadComponent: () =>
      import('./features/membership/membership-page.component').then(
        (m) => m.MembershipPageComponent
      )
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./features/help/help-page.component').then((m) => m.HelpPageComponent)
  }
];

export const WEBSITE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/website-shell/website-shell.component').then((m) => m.WebsiteShellComponent),
    children: WEBSITE_PAGE_ROUTES
  }
];
