import { Injectable } from '@angular/core';
import { ReviewDocument } from '../../../core/firebase/models/firestore-data.models';
import { FirebaseFunctionsService } from '../../../core/firebase/services/firebase-functions.service';
import { AuthService } from '../auth/services/auth.service';

export type CreateReview = Pick<ReviewDocument, 'jobId' | 'rating' | 'title' | 'comment'>;

@Injectable({ providedIn: 'root' })
export class ReviewService {
  constructor(private readonly functions: FirebaseFunctionsService, private readonly auth: AuthService) {}
  create(review: CreateReview): Promise<ReviewDocument> {
    const user = this.auth.authUser();
    if (!user) return Promise.reject(new Error('Sign in is required.'));
    return this.functions.call<ReviewDocument>('createReview', review, user.idToken);
  }
}
