import { TestBed } from '@angular/core/testing';
import { AuthUser } from '../models/auth-user.model';
import { UserProfileService } from './user-profile.service';

describe('UserProfileService public registration', () => {
  let service: UserProfileService;
  const authUser: AuthUser = { id: 'uid-1', email: 'user@example.com', idToken: 'token', refreshToken: 'refresh', expiresAt: Date.now() + 10000, claims: { admin: false, paidResident: false } };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserProfileService);
  });

  it('reports a missing Firestore profile', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response('{}', { status: 404 }));
    await service.syncCurrentProfile(authUser);
    expect(service.currentProfile()).toBeNull();
    expect(service.profileLoadError()).toContain('profile is missing');
  });

  it('recovers from a failed profile request on retry', async () => {
    const request = spyOn(window, 'fetch').and.rejectWith(new TypeError('Network error'));
    await service.syncCurrentProfile(authUser);
    await service.waitUntilReady();
    expect(service.profileLoadError()).toContain('Check your connection');
    expect(service.initializationState()).toBe('ready');
    request.and.resolveTo(new Response(JSON.stringify({ fields: {
      role: { stringValue: 'admin' }, status: { stringValue: 'active' }
    } }), { status: 200 }));
    await service.syncCurrentProfile(authUser);
    expect(service.profileLoadError()).toBeNull();
    expect(service.isAdmin()).toBeTrue();
  });

  it('reports invalid profile fields instead of a pending approval', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ fields: {
      role: { stringValue: 'admin' }
    } }), { status: 200 }));
    await service.syncCurrentProfile(authUser);
    expect(service.profileLoadError()).toContain('invalid role or status');
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

  for (const role of ['admin', 'super_admin'] as const) {
    it(`recognizes an active ${role} profile as an administrator`, async () => {
      spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ fields: {
        id: { stringValue: 'uid-1' }, email: { stringValue: authUser.email },
        fullName: { stringValue: 'Portal Administrator' }, role: { stringValue: role },
        status: { stringValue: 'active' }, membershipStatus: { stringValue: 'none' },
        createdAt: { timestampValue: '2026-01-01T00:00:00Z' }
      } }), { status: 200 }));

      await service.syncCurrentProfile(authUser);

      expect(service.isAdmin()).toBeTrue();
    });
  }
});
