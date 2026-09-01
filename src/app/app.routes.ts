import { Routes, UrlSegment } from '@angular/router';

const websitePageMatcher = (segments: UrlSegment[]) => {
  const isLandingPage = segments.length === 0;
  const isStaticPage =
    segments.length === 1 && ['help', 'membership', 'our-community', 'projects', 'resident-services', 'resources', 'security'].includes(segments[0].path);

  return isLandingPage || isStaticPage ? { consumed: [] } : null;
};

export const routes: Routes = [
  {
    matcher: websitePageMatcher,
    loadChildren: () => import('./website/website.routes').then((m) => m.WEBSITE_ROUTES)
  },
  {
    path: '',
    loadChildren: () => import('./webapp/webapp.routes').then((m) => m.WEBAPP_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
