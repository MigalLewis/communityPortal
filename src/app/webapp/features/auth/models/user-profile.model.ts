import { UserRole } from './user-role.model';

export const USER_ACCOUNT_STATUSES = ['pending', 'active', 'rejected', 'deactivated'] as const;

export type UserAccountStatus = (typeof USER_ACCOUNT_STATUSES)[number];
export const MEMBERSHIP_STATUSES = ['none', 'pending', 'active', 'expired', 'cancelled'] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  createdAt: string;
  phone?: string;
  acceptedTermsAt?: string;
  businessName?: string;
  serviceCategories?: string[];
  serviceAreas?: string[];
  businessDescription?: string;
  businessContactEmail?: string;
  businessContactPhone?: string;
  businessWebsite?: string;
  verificationDocumentName?: string;
  verificationDocumentType?: string;
  verificationDocumentReference?: string;
  approvedAt?: string;
  approvedBy?: string;
  deactivatedAt?: string;
  deactivatedBy?: string;
  membershipStatus: MembershipStatus;
  membershipStartedAt?: string;
  membershipExpiresAt?: string;
  externalPaymentReference?: string;
}
