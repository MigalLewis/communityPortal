import { TestBed } from '@angular/core/testing';
import { AuthService, ProfileOnboardingRequiredError } from './auth.service';
import { UserProfileService } from './user-profile.service';

describe('AuthService registration', () => {
  let service: AuthService;
  let profiles: jasmine.SpyObj<UserProfileService>;
  const registration = { role: 'resident' as const, fullName: 'Rita', email: 'rita@example.com', password: 'secret1', phone: '5551234', acceptedTermsAt: 'now' };

  beforeEach(() => {
    localStorage.clear();
    profiles = jasmine.createSpyObj<UserProfileService>('UserProfileService', ['syncCurrentProfile', 'createPublicProfile', 'clearCurrentProfile']);
    TestBed.configureTestingModule({ providers: [AuthService, { provide: UserProfileService, useValue: profiles }] });
    service = TestBed.inject(AuthService);
  });

  it('maps duplicate-email responses to an actionable error', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ error: { message: 'EMAIL_EXISTS' } }), { status: 400 }));
    await expectAsync(service.register(registration)).toBeRejectedWithError(/already exists/);
  });

  it('passes only an allowed public role to profile creation', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ localId: 'uid', email: registration.email, idToken: 'id', refreshToken: 'refresh', expiresIn: '3600' }), { status: 200 }));
    profiles.createPublicProfile.and.resolveTo();
    await service.register(registration);
    expect(profiles.createPublicProfile).toHaveBeenCalledWith(jasmine.any(Object), jasmine.objectContaining({ role: 'resident' }));
  });

  it('exposes a recoverable partial-account error and can retry without another sign-up', async () => {
    const fetchSpy = spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ localId: 'uid', email: registration.email, idToken: 'id', refreshToken: 'refresh', expiresIn: '3600' }), { status: 200 }));
    profiles.createPublicProfile.and.rejectWith(new Error('firestore unavailable'));
    await expectAsync(service.register(registration)).toBeRejectedWithError(ProfileOnboardingRequiredError);
    profiles.createPublicProfile.and.resolveTo();
    await service.retryProfileCreation(registration);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(profiles.createPublicProfile).toHaveBeenCalledTimes(2);
  });
});
