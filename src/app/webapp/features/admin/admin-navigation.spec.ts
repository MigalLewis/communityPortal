import { ADMIN_NAVIGATION } from './admin-navigation';

describe('ADMIN_NAVIGATION', () => {
  it('provides a clear administrator account settings entry point', () => {
    expect(ADMIN_NAVIGATION).toContain(jasmine.objectContaining({
      label: 'Account Settings', route: '/admin/settings'
    }));
  });

  it('links to the distinct community-project manager', () => {
    expect(ADMIN_NAVIGATION).toContain(jasmine.objectContaining({ label: 'Manage Projects', route: '/admin/projects' }));
  });
});
