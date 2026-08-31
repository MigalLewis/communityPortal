import { USER_ACCOUNT_STATUSES, UserAccountStatus, UserProfile } from './user-profile.model';
import { USER_ROLES, UserRole } from './user-role.model';

describe('authenticated user models', () => {
  it('supports every authenticated role', () => {
    const roles: UserRole[] = ['resident', 'paid_resident', 'contractor', 'admin'];

    expect(USER_ROLES).toEqual(roles);
  });

  it('supports every account lifecycle status', () => {
    const statuses: UserAccountStatus[] = ['pending', 'active', 'rejected', 'deactivated'];

    expect(USER_ACCOUNT_STATUSES).toEqual(statuses);
  });

  it('represents anonymous access without a user profile', () => {
    const anonymousProfile: UserProfile | null = null;

    expect(anonymousProfile).toBeNull();
    expect(USER_ROLES).not.toContain('anonymous' as UserRole);
  });

  it('supports approval and deactivation lifecycle metadata', () => {
    const profile: UserProfile = {
      id: 'user-1',
      fullName: 'Resident User',
      email: 'resident@example.com',
      role: 'paid_resident',
      status: 'deactivated',
      membershipStatus: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      approvedAt: '2026-01-02T00:00:00.000Z',
      approvedBy: 'admin-1',
      deactivatedAt: '2026-02-01T00:00:00.000Z',
      deactivatedBy: 'admin-2'
    };

    expect(profile.status).toBe('deactivated');
    expect(profile.approvedBy).toBe('admin-1');
    expect(profile.deactivatedBy).toBe('admin-2');
  });
});
