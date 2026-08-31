import { Injectable } from '@angular/core';
import { FirestoreDataService } from '../../core/firebase/services/firestore-data.service';
import { UserDocument, UserTransitionAuditDocument } from '../../core/firebase/models/firestore-data.models';
import { firebaseConfig } from '../../../environments/firebase.config';
import { AuthService } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';

export type UserTransition = 'approve' | 'reject' | 'deactivate';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  constructor(
    private readonly data: FirestoreDataService,
    private readonly auth: AuthService,
    private readonly profiles: UserProfileService
  ) {}

  async listUsers(): Promise<UserDocument[]> {
    this.assertAdmin();
    return this.data.users.list(this.auth.authUser()?.idToken);
  }

  async listAuditHistory(): Promise<UserTransitionAuditDocument[]> {
    this.assertAdmin();
    return this.data.userTransitionAudits.list(this.auth.authUser()?.idToken);
  }

  async transition(userId: string, action: UserTransition, reason?: string): Promise<void> {
    this.assertAdmin();
    const token = this.auth.authUser()!.idToken;
    const response = await fetch(
      `https://us-central1-${firebaseConfig.projectId}.cloudfunctions.net/manageUser`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: { userId, action, reason: reason?.trim() || null } })
      }
    );
    const payload = await response.json() as { error?: { message?: string } };
    if (!response.ok || payload.error) throw new Error(payload.error?.message ?? 'The account could not be updated.');
  }

  private assertAdmin(): void {
    if (!this.auth.isAuthenticated() || !this.profiles.isAdmin()) {
      throw new Error('Administrator access is required.');
    }
  }
}
