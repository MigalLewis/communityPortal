import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ContractorRepository } from '../../contractor-directory/services/contractor.repository';

export const approvedContractorGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const profile = await inject(ContractorRepository).getOwned();
  return profile?.status === 'active' && profile.approvalStatus === 'approved'
    ? true : router.createUrlTree(['/account/pending']);
};
