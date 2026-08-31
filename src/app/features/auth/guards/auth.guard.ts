import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const profile = inject(UserProfileService);

  return authService.isAuthenticated() && profile.currentProfile()?.status === 'active'
    ? true
    : router.createUrlTree(['/login'], { queryParams: { redirectTo: state.url } });
};
