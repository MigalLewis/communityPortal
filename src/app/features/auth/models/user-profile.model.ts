import { UserRole } from './user-role.model';

export const USER_ACCOUNT_STATUSES = ['pending', 'active', 'rejected', 'deactivated'] as const;

export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
}
