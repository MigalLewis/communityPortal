import { activeUserGuard } from './features/auth/guards/access.guards';
import { adminRoleGuard } from './features/auth/guards/admin-role.guard';
import { SettingsPageComponent } from './features/settings/settings-page.component';
import { WEBAPP_PAGE_ROUTES } from './webapp.routes';

describe('account settings routes', () => {
  it('keeps the shared settings route protected by the existing active-account guard', () => {
    const settings = WEBAPP_PAGE_ROUTES.find((route) => route.path === 'settings');
    expect(settings?.canActivate).toEqual([activeUserGuard]);
  });

  it('registers lazy administrator settings inside the fully guarded admin area', async () => {
    const admin = WEBAPP_PAGE_ROUTES.find((route) => route.path === 'admin');
    const settings = admin?.children?.find((route) => route.path === 'settings');
    expect(admin?.canActivate).toEqual([adminRoleGuard]);
    expect(admin?.canActivateChild).toEqual([adminRoleGuard]);
    expect(settings).toBeDefined();
    expect(await settings!.loadComponent!()).toBe(SettingsPageComponent);
  });
});
