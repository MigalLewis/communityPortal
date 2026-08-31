import { Injectable, computed, signal } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';
import { AuthUser } from '../models/auth-user.model';
import { USER_ACCOUNT_STATUSES, UserAccountStatus, UserProfile } from '../models/user-profile.model';
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
  };
}

@Injectable({ providedIn: 'root' })
export class UserProfileService {
  private readonly appUserSignal = signal<UserProfile | null>(null);

  readonly currentProfile = computed(() => this.appUserSignal());
  readonly isResident = computed(() => this.currentProfile()?.role === 'resident');
  readonly isAdmin = computed(() => this.currentProfile()?.role === 'admin');

  async createResidentProfile(authUser: AuthUser, fullName: string): Promise<void> {
    const profile: UserProfile = {
      id: authUser.id,
      fullName,
      email: authUser.email,
      role: 'resident',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    await fetch(`${firebaseClient.firestoreBaseUrl}/users/${authUser.id}?key=${firebaseClient.apiKey}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authUser.idToken}`
      },
      body: JSON.stringify({
        fields: {
          id: { stringValue: profile.id },
          fullName: { stringValue: profile.fullName },
          email: { stringValue: profile.email },
          role: { stringValue: profile.role },
          status: { stringValue: profile.status },
          createdAt: { timestampValue: profile.createdAt }
        }
      })
    });

    this.appUserSignal.set(profile);
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
