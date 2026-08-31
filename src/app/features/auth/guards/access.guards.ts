import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { UserProfile } from '../models/user-profile.model';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';

type AccessTest = (profile: UserProfile, auth: AuthService) => boolean;

function statusDestination(status: UserProfile['status']): string | null {
  return status === 'pending' ? '/account/pending'
    : status === 'rejected' ? '/account/rejected'
    : status === 'deactivated' ? '/account/deactivated' : null;
}

function guard(test: AccessTest, denied = '/dashboard'): CanActivateFn {
  return async (_route, state): Promise<boolean | UrlTree> => {
    const auth = inject(AuthService);
    const profiles = inject(UserProfileService);
    const router = inject(Router);
    await auth.waitUntilReady();
    await profiles.waitUntilReady();

    if (!auth.isAuthenticated()) {
      return router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
    }
    const profile = profiles.currentProfile();
    if (!profile) return router.createUrlTree(['/account/pending']);
    const statusPage = statusDestination(profile.status);
    if (statusPage) return router.createUrlTree([statusPage]);
    return test(profile, auth) ? true : router.createUrlTree([denied]);
  };
}

export const authenticatedGuard = guard(() => true);
export const activeUserGuard = guard(() => true);
export const administratorGuard = guard((_profile, auth) => auth.authUser()?.claims.admin === true);
export const contractorGuard = guard((profile) => profile.role === 'contractor');
export const residentOrPaidResidentGuard = guard((profile, auth) =>
  profile.role === 'resident' || (profile.role === 'paid_resident' && auth.authUser()?.claims.paidResident === true));

