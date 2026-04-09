import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  it('allows navigation when user is authenticated', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated: () => true } }]
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as Parameters<typeof authGuard>[0], { url: '/messages' } as Parameters<typeof authGuard>[1])
    );

    expect(result).toBeTrue();
  });

  it('redirects to login when user is not authenticated', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: { isAuthenticated: () => false } }]
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as Parameters<typeof authGuard>[0], { url: '/messages' } as Parameters<typeof authGuard>[1])
    );

    expect(result).toEqual(router.createUrlTree(['/login'], { queryParams: { redirectTo: '/messages' } }));
  });
});
