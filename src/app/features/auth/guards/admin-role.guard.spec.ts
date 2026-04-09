import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { adminRoleGuard } from './admin-role.guard';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';

describe('adminRoleGuard', () => {
  it('allows admin users', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: UserProfileService, useValue: { isAdmin: () => true } }
      ]
    });

    const result = TestBed.runInInjectionContext(() =>
      adminRoleGuard({} as Parameters<typeof adminRoleGuard>[0], {} as Parameters<typeof adminRoleGuard>[1])
    );

    expect(result).toBeTrue();
  });

  it('redirects unauthenticated users to login', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => false } },
        { provide: UserProfileService, useValue: { isAdmin: () => false } }
      ]
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      adminRoleGuard({} as Parameters<typeof adminRoleGuard>[0], {} as Parameters<typeof adminRoleGuard>[1])
    );

    expect(result).toEqual(router.createUrlTree(['/login']));
  });

  it('redirects authenticated non-admin users to dashboard', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { isAuthenticated: () => true } },
        { provide: UserProfileService, useValue: { isAdmin: () => false } }
      ]
    });

    const router = TestBed.inject(Router);
    const result = TestBed.runInInjectionContext(() =>
      adminRoleGuard({} as Parameters<typeof adminRoleGuard>[0], {} as Parameters<typeof adminRoleGuard>[1])
    );

    expect(result).toEqual(router.createUrlTree(['/dashboard']));
  });
});
