import { TestBed } from '@angular/core/testing';
import { AuthUser } from '../models/auth-user.model';
import { UserProfileService } from './user-profile.service';

describe('UserProfileService public registration', () => {
  let service: UserProfileService;
  const authUser: AuthUser = { id: 'uid-1', email: 'user@example.com', idToken: 'token', refreshToken: 'refresh', expiresAt: Date.now() + 10000 };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfileService);
  });

  it('assigns an active resident role', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response('{}', { status: 200 }));
    await service.createPublicProfile(authUser, { role: 'resident', fullName: 'Rita Resident', phone: '5551234', acceptedTermsAt: '2026-01-01T00:00:00Z' });
    expect(service.getCurrentUserProfile()).toEqual(jasmine.objectContaining({ role: 'resident', status: 'active' }));
    expect(JSON.parse(fetchSpy.calls.mostRecent().args[1]!.body as string).fields.role.stringValue).toBe('resident');
  });

  for (const role of ['paid_resident', 'contractor'] as const) {
    it(`assigns a pending ${role} role`, async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response('{}', { status: 200 }));
      await service.createPublicProfile(authUser, { role, fullName: 'Pending User', phone: '5551234', acceptedTermsAt: '2026-01-01T00:00:00Z' });
      expect(service.getCurrentUserProfile()).toEqual(jasmine.objectContaining({ role, status: 'pending' }));
    });
  }

  it('rejects failed profile writes instead of treating a partial account as complete', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response('{}', { status: 503 }));
    await expectAsync(service.createPublicProfile(authUser, { role: 'resident', fullName: 'Rita', phone: '5551234', acceptedTermsAt: 'now' })).toBeRejectedWithError(/incomplete/);
    expect(service.getCurrentUserProfile()).toBeNull();
  });
});
