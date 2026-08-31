import { UserManagementService } from './user-management.service';

describe('UserManagementService authorization', () => {
  function service(authenticated: boolean, admin: boolean): UserManagementService {
    const data = { users: { list: jasmine.createSpy() }, userTransitionAudits: { list: jasmine.createSpy() } } as any;
    const auth = { isAuthenticated: () => authenticated, authUser: () => ({ idToken: 'token' }) } as any;
    const profiles = { isAdmin: () => admin } as any;
    return new UserManagementService(data, auth, profiles);
  }

  it('does not let a non-admin list managed users', async () => {
    await expectAsync(service(true, false).listUsers()).toBeRejectedWithError('Administrator access is required.');
  });

  it('does not let a non-admin invoke an account transition', async () => {
    spyOn(window, 'fetch');
    await expectAsync(service(true, false).transition('victim', 'deactivate')).toBeRejectedWithError('Administrator access is required.');
    expect(window.fetch).not.toHaveBeenCalled();
  });

  it('does not let an unauthenticated caller invoke an account transition', async () => {
    spyOn(window, 'fetch');
    await expectAsync(service(false, false).transition('victim', 'approve')).toBeRejectedWithError('Administrator access is required.');
    expect(window.fetch).not.toHaveBeenCalled();
  });
});
