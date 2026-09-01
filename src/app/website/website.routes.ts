import { Routes } from '@angular/router';

/** Public website pages that do not require account features. */
export const WEBSITE_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing-page.component').then((m) => m.LandingPageComponent)
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./features/help/help-page.component').then((m) => m.HelpPageComponent)
  }
];
