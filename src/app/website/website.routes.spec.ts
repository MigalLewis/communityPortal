import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { routes } from '../app.routes';

describe('public legal routes', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  for (const [path, title] of [
    ['/privacy', 'Privacy Policy | Parktown North Residents Association'],
    ['/terms', 'Terms and Conditions | Parktown North Residents Association']
  ]) {
    it(`resolves ${path} as a titled public website page`, async () => {
      const router = TestBed.inject(Router);
      const navigated = await router.navigateByUrl(path);

      expect(navigated).toBeTrue();
      expect(router.url).toBe(path);
      expect(router.routerState.snapshot.root.firstChild?.firstChild?.title).toBe(title);
    });
  }
});

describe('public content detail routes', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));

  for (const path of [
    '/projects/pocket-park',
    '/events/spring-community-market-day',
    '/our-community/portfolios/civic-affairs',
    '/our-community/heritage/parktown-north-heritage',
    '/our-community/maps/neighbourhood-map'
  ]) {
    it(`resolves the stable content URL ${path}`, async () => {
      const router = TestBed.inject(Router);
      expect(await router.navigateByUrl(path)).toBeTrue();
      expect(router.url).toBe(path);
    });
  }

  for (const [unknown, fallback] of [
    ['/projects/not-a-project', '/projects'],
    ['/events/not-an-event', '/events'],
    ['/our-community/heritage/not-a-place', '/our-community']
  ]) {
    it(`redirects the unknown slug ${unknown}`, async () => {
      const router = TestBed.inject(Router);
      await router.navigateByUrl(unknown);
      await new Promise((resolve) => setTimeout(resolve));
      expect(router.url).toBe(fallback);
    });
  }
});
