import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ContractorRepository } from '../../contractor-directory/services/contractor.repository';
import { approvedContractorGuard } from './approved-contractor.guard';

describe('approvedContractorGuard', () => {
  async function run(profile: { status: string; approvalStatus: string } | null) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: ContractorRepository, useValue: { getOwned: async () => profile } }] });
    return TestBed.runInInjectionContext(() => approvedContractorGuard({} as never, {} as never)) as Promise<true | import('@angular/router').UrlTree>;
  }
  it('allows only active approved contractor documents', async () => expect(await run({ status: 'active', approvalStatus: 'approved' })).toBeTrue());
  it('rejects missing, rejected and deactivated contractor documents', async () => {
    for (const profile of [null, { status: 'active', approvalStatus: 'rejected' }, { status: 'deactivated', approvalStatus: 'approved' }]) {
      const result = await run(profile); expect(TestBed.inject(Router).serializeUrl(result as import('@angular/router').UrlTree)).toBe('/account/pending');
    }
  });
});
