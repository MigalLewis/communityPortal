import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Type } from '@angular/core';
import { provideRouter } from '@angular/router';
import { EventsPageComponent } from './features/events/events-page.component';
import { LandingPageComponent } from './features/landing/landing-page.component';
import { OurCommunityPageComponent } from './features/our-community/our-community-page.component';
import { ProjectsPageComponent } from './features/projects/projects-page.component';

describe('public content navigation', () => {
  for (const component of [LandingPageComponent, OurCommunityPageComponent, ProjectsPageComponent, EventsPageComponent] as Type<unknown>[]) {
    it(`${component.name} reserves mailto links for explicitly labelled email actions`, async () => {
      await TestBed.configureTestingModule({ imports: [component], providers: [provideRouter([])] }).compileComponents();
      const fixture: ComponentFixture<unknown> = TestBed.createComponent(component);
      fixture.detectChanges();
      const root = fixture.nativeElement as HTMLElement;

      for (const anchor of Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="mailto:"]'))) {
        expect(anchor.textContent?.trim()).toMatch(/^(Email PNRA|Request information)/);
      }
      for (const label of ['View event', 'View details', 'View project', 'Read more', 'Learn more']) {
        const matching = Array.from(root.querySelectorAll('a')).filter((anchor) => anchor.textContent?.trim().toLowerCase().startsWith(label.toLowerCase()));
        expect(matching.every((anchor) => !anchor.getAttribute('href')?.startsWith('mailto:'))).toBeTrue();
      }
    });
  }
});
