import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const profiles = inject(UserProfileService);
  const router = inject(Router);
  await authService.waitUntilReady();
  await profiles.waitUntilReady();

  if (!authService.isAuthenticated()) return true;
  const status = profiles.currentProfile()?.status;
  return status && status !== 'active'
    ? router.createUrlTree([`/account/${status}`])
    : router.createUrlTree(['/dashboard']);
};
