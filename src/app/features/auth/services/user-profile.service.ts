import { Injectable, computed, signal } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';
import { AuthUser } from '../models/auth-user.model';
import { MEMBERSHIP_STATUSES, MembershipStatus, USER_ACCOUNT_STATUSES, UserAccountStatus, UserProfile } from '../models/user-profile.model';
import { USER_ROLES, UserRole } from '../models/user-role.model';

interface FirestoreDocumentResponse {
  fields?: {
    id?: { stringValue: string };
    fullName?: { stringValue: string };
    email?: { stringValue: string };
    role?: { stringValue: UserRole };
    status?: { stringValue: UserAccountStatus };
    createdAt?: { timestampValue: string };
    approvedAt?: { timestampValue: string };
    approvedBy?: { stringValue: string };
    deactivatedAt?: { timestampValue: string };
    deactivatedBy?: { stringValue: string };
    membershipStatus?: { stringValue: MembershipStatus };
    membershipStartedAt?: { timestampValue: string };
    membershipExpiresAt?: { timestampValue: string };
    externalPaymentReference?: { stringValue: string };
  };
}

export type PublicRegistrationRole = 'resident' | 'paid_resident' | 'contractor';

export interface PublicProfileRegistration {
  role: PublicRegistrationRole;
  fullName: string;
  phone: string;
  acceptedTermsAt: string;
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
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly appUserSignal = signal<UserProfile | null>(null);

  readonly currentProfile = computed(() => this.appUserSignal());
  readonly isResident = computed(() => this.currentProfile()?.role === 'resident');
  readonly isAdmin = computed(() => this.currentProfile()?.role === 'admin' && this.currentProfile()?.status === 'active');

  async createPublicProfile(authUser: AuthUser, registration: PublicProfileRegistration): Promise<void> {
    const profile: UserProfile = {
      ...registration,
      id: authUser.id,
      fullName: registration.fullName,
      email: authUser.email,
      role: registration.role,
      status: registration.role === 'resident' ? 'active' : 'pending',
      membershipStatus: registration.role === 'paid_resident' ? 'pending' : 'none',
      createdAt: new Date().toISOString()
    };

    const fields = this.toFirestoreFields(profile);
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}/users/${authUser.id}?key=${firebaseClient.apiKey}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authUser.idToken}`
      },
      body: JSON.stringify({ fields })
    });

    if (!response.ok) {
      throw new Error('Your sign-in was created, but profile setup is incomplete. Please retry onboarding.');
    }

    this.appUserSignal.set(profile);
  }

  private toFirestoreFields(profile: UserProfile): Record<string, unknown> {
    const fields: Record<string, unknown> = {
      id: { stringValue: profile.id }, fullName: { stringValue: profile.fullName },
      email: { stringValue: profile.email }, role: { stringValue: profile.role },
      status: { stringValue: profile.status }, createdAt: { timestampValue: profile.createdAt }
    };
    for (const [key, value] of Object.entries(profile)) {
      if (fields[key] || value === undefined || ['id', 'fullName', 'email', 'role', 'status', 'createdAt'].includes(key)) continue;
      fields[key] = Array.isArray(value)
        ? { arrayValue: { values: value.map((item) => ({ stringValue: item })) } }
        : { stringValue: value };
    }
    return fields;
  }

  async syncCurrentProfile(authUser: AuthUser | null): Promise<void> {
    if (!authUser) {
      this.appUserSignal.set(null);
      return;
    }

    const response = await fetch(`${firebaseClient.firestoreBaseUrl}/users/${authUser.id}?key=${firebaseClient.apiKey}`, {
      headers: {
        Authorization: `Bearer ${authUser.idToken}`
      }
    });

    if (!response.ok) {
      this.appUserSignal.set(null);
      return;
    }

    const doc = (await response.json()) as FirestoreDocumentResponse;

    const role = doc.fields?.role?.stringValue;
    const status = doc.fields?.status?.stringValue;

    if (!doc.fields || !this.isUserRole(role) || !this.isUserAccountStatus(status)) {
      this.appUserSignal.set(null);
      return;
    }

    this.appUserSignal.set({
      id: doc.fields.id?.stringValue ?? authUser.id,
      fullName: doc.fields.fullName?.stringValue ?? '',
      email: doc.fields.email?.stringValue ?? authUser.email,
      role,
      status,
      createdAt: doc.fields.createdAt?.timestampValue ?? new Date().toISOString(),
      approvedAt: doc.fields.approvedAt?.timestampValue,
      approvedBy: doc.fields.approvedBy?.stringValue,
      deactivatedAt: doc.fields.deactivatedAt?.timestampValue,
      deactivatedBy: doc.fields.deactivatedBy?.stringValue
      , membershipStatus: MEMBERSHIP_STATUSES.includes(doc.fields.membershipStatus?.stringValue as MembershipStatus)
        ? doc.fields.membershipStatus!.stringValue
        : 'none',
      membershipStartedAt: doc.fields.membershipStartedAt?.timestampValue,
      membershipExpiresAt: doc.fields.membershipExpiresAt?.timestampValue,
      externalPaymentReference: doc.fields.externalPaymentReference?.stringValue
    });
  }

  clearCurrentProfile(): void {
    this.appUserSignal.set(null);
  }

  getCurrentUserProfile(): UserProfile | null {
    return this.currentProfile();
  }

  getCurrentUserRole(): UserRole | null {
    return this.currentProfile()?.role ?? null;
  }

  private isUserRole(value: string | undefined): value is UserRole {
    return USER_ROLES.some((role) => role === value);
  }

  private isUserAccountStatus(value: string | undefined): value is UserAccountStatus {
    return USER_ACCOUNT_STATUSES.some((status) => status === value);
  }
}
