import { Injectable } from '@angular/core';
import { ContractorDocument, ReviewDocument, UserDocument } from '../../../core/firebase/models/firestore-data.models';
import { FirebaseFunctionsService } from '../../../core/firebase/services/firebase-functions.service';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';

export type ReviewModerationAction = 'approve' | 'reject' | 'restore' | 'remove';
export interface AdminReviewData { reviews: ReviewDocument[]; users: UserDocument[]; contractors: ContractorDocument[]; }

@Injectable({ providedIn: 'root' })
export class AdminReviewService {
  constructor(
    private readonly data: FirestoreDataService,
    private readonly functions: FirebaseFunctionsService,
    private readonly auth: AuthService,
    private readonly profiles: UserProfileService
  ) {}

  async list(): Promise<AdminReviewData> {
    const token = this.adminToken();
    const [reviews, users, contractors] = await Promise.all([
      this.data.reviews.list(token), this.data.users.list(token), this.data.contractors.list(token)
    ]);
    return { reviews, users, contractors };
  }

  async moderate(reviewId: string, action: ReviewModerationAction, reason?: string): Promise<void> {
    await this.functions.call<{ ok: true }>('manageReview', { reviewId, action, reason: reason?.trim() || null }, this.adminToken());
  }

  private adminToken(): string {
    const user = this.auth.authUser();
    if (!user || !this.profiles.isAdmin()) throw new Error('Administrator access is required.');
    return user.idToken;
  }
}
