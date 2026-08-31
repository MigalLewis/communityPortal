import { Injectable } from '@angular/core';
import { JobDocument } from '../../core/firebase/models/firestore-data.models';
import { FirebaseFunctionsService } from '../../core/firebase/services/firebase-functions.service';
import { AuthService } from '../auth/services/auth.service';

export type CreateJobRequest = Pick<JobDocument, 'contractorId' | 'categoryId' | 'title' | 'description' | 'budget' | 'scheduledDate'>;

/** Paid membership may add future priority/analytics features; it never gates base viewing, hiring, or rating. */
export const RESIDENT_HIRING_FEATURES = {
  resident: { view: true, hire: true, rate: true, priorityRequests: false },
  paid_resident: { view: true, hire: true, rate: true, priorityRequests: true }
} as const;

@Injectable({ providedIn: 'root' })
export class JobRequestService {
  constructor(private readonly functions: FirebaseFunctionsService, private readonly auth: AuthService) {}
  create(request: CreateJobRequest): Promise<JobDocument> {
    const user = this.auth.authUser();
    if (!user) return Promise.reject(new Error('Sign in is required.'));
    return this.functions.call<JobDocument>('createJobRequest', request, user.idToken);
  }
}
