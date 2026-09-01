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
