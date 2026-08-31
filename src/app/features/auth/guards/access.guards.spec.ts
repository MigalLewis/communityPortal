import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { UserProfile } from '../models/user-profile.model';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';
import { activeUserGuard, administratorGuard, contractorGuard, residentOrPaidResidentGuard } from './access.guards';

describe('access guards', () => {
  const profile = (role: UserProfile['role'], status: UserProfile['status'] = 'active'): UserProfile => ({
    id: 'u1', fullName: 'User', email: 'user@example.com', role, status, membershipStatus: 'none', createdAt: '2026-01-01T00:00:00Z'
  });

  async function run(guard: typeof activeUserGuard, value: UserProfile | null, claims = { admin: false, paidResident: false }, authenticated = true,
    waits: { auth?: Promise<void>; profile?: Promise<void> } = {}): Promise<true | UrlTree> {
    const auth = {
      waitUntilReady: () => waits.auth ?? Promise.resolve(), isAuthenticated: () => authenticated,
      authUser: () => authenticated ? { claims } : null
    };
    const profiles = { waitUntilReady: () => waits.profile ?? Promise.resolve(), currentProfile: () => value };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([]), { provide: AuthService, useValue: auth }, { provide: UserProfileService, useValue: profiles }] });
    return TestBed.runInInjectionContext(() => guard({} as never, { url: '/protected' } as never)) as Promise<true | UrlTree>;
  }

  const path = (tree: true | UrlTree): string => tree === true ? 'allowed' : TestBed.inject(Router).serializeUrl(tree);

  it('redirects an anonymous user to login', async () => expect(path(await run(activeUserGuard, null, undefined, false))).toBe('/login?redirectTo=%2Fprotected'));
  for (const status of ['pending', 'rejected', 'deactivated'] as const) {
    it(`redirects a ${status} account to its status page`, async () => expect(path(await run(activeUserGuard, profile('resident', status)))).toBe(`/account/${status}`));
  }
  it('allows an active user', async () => expect(await run(activeUserGuard, profile('resident'))).toBeTrue());
  it('allows a resident capability', async () => expect(await run(residentOrPaidResidentGuard, profile('resident'))).toBeTrue());
  it('requires a trusted claim for a paid resident', async () => {
    expect(path(await run(residentOrPaidResidentGuard, profile('paid_resident')))).toBe('/dashboard');
    expect(await run(residentOrPaidResidentGuard, profile('paid_resident'), { admin: false, paidResident: true })).toBeTrue();
  });
  it('allows only contractors through the contractor guard', async () => {
    expect(await run(contractorGuard, profile('contractor'))).toBeTrue();
    expect(path(await run(contractorGuard, profile('resident')))).toBe('/dashboard');
  });
  it('requires a trusted claim rather than the profile role for administrators', async () => {
    expect(path(await run(administratorGuard, profile('admin')))).toBe('/dashboard');
    expect(await run(administratorGuard, profile('resident'), { admin: true, paidResident: false })).toBeTrue();
  });
  it('waits for delayed authentication and profile initialization', async () => {
    let releaseAuth!: () => void; let releaseProfile!: () => void;
    const authWait = new Promise<void>((resolve) => releaseAuth = resolve);
    const profileWait = new Promise<void>((resolve) => releaseProfile = resolve);
    let settled = false;
    const result = run(activeUserGuard, profile('resident'), undefined, true, { auth: authWait, profile: profileWait }).then((value) => { settled = true; return value; });
    await Promise.resolve(); expect(settled).toBeFalse();
    releaseAuth(); await Promise.resolve(); expect(settled).toBeFalse();
    releaseProfile(); expect(await result).toBeTrue();
  });
});
