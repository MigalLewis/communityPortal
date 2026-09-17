import { ADMIN_NAVIGATION } from './admin-navigation';

describe('ADMIN_NAVIGATION', () => {
  it('provides a clear administrator account settings entry point', () => {
    expect(ADMIN_NAVIGATION).toContain(jasmine.objectContaining({
      label: 'Account Settings', route: '/admin/settings'
    }));
  });
});
