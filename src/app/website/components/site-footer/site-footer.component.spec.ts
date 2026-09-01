import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  it('links both legal pages through the Angular router', async () => {
    await TestBed.configureTestingModule({
      imports: [SiteFooterComponent],
      providers: [provideRouter([
        { path: 'privacy', component: SiteFooterComponent },
        { path: 'terms', component: SiteFooterComponent }
      ])]
    }).compileComponents();

    const fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.detectChanges();
    const links = Array.from(fixture.nativeElement.querySelectorAll('.footer-links a')) as HTMLAnchorElement[];
    const router = TestBed.inject(Router);

    for (const [label, path] of [['Privacy Policy', '/privacy'], ['Terms & Conditions', '/terms']]) {
      const link = links.find(({ textContent }) => textContent?.trim() === label);
      expect(link).withContext(`${label} is present`).toBeDefined();
      expect(link!.getAttribute('href')).toBe(path);
      await router.navigateByUrl(path);
      expect(router.url).toBe(path);
    }
  });
});
