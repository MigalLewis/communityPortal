import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserProfileService } from '../services/user-profile.service';
import { AuthService } from '../services/auth.service';

export const adminRoleGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const userProfileService = inject(UserProfileService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  return userProfileService.isAdmin() ? true : router.createUrlTree(['/dashboard']);
};
