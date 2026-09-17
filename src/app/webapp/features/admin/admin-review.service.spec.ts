import { TestBed } from '@angular/core/testing';
import { FirebaseFunctionsService } from '../../../core/firebase/services/firebase-functions.service';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';
import { AdminReviewService } from './admin-review.service';

describe('AdminReviewService', () => {
  let service: AdminReviewService;
  const data = { reviews: { list: jasmine.createSpy() }, users: { list: jasmine.createSpy() }, contractors: { list: jasmine.createSpy() } };
  const functions = { call: jasmine.createSpy() };
  const auth = { authUser: jasmine.createSpy() };
  const profiles = { isAdmin: jasmine.createSpy() };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AdminReviewService,
      { provide: FirestoreDataService, useValue: data }, { provide: FirebaseFunctionsService, useValue: functions },
      { provide: AuthService, useValue: auth }, { provide: UserProfileService, useValue: profiles }] });
    service = TestBed.inject(AdminReviewService); jasmine.getEnv().allowRespy(true);
    auth.authUser.and.returnValue({ idToken: 'token' }); profiles.isAdmin.and.returnValue(true);
    data.reviews.list.and.resolveTo([]); data.users.list.and.resolveTo([]); data.contractors.list.and.resolveTo([]);
    functions.call.and.resolveTo({ ok: true });
  });
  it('uses authenticated requests to list every review and related party', async () => {
    await service.list(); expect(data.reviews.list).toHaveBeenCalledWith('token'); expect(data.users.list).toHaveBeenCalledWith('token');
  });
  it('sends moderation through the trusted callable and forwards errors', async () => {
    await service.moderate('review', 'reject', ' abusive ');
    expect(functions.call).toHaveBeenCalledWith('manageReview', { reviewId: 'review', action: 'reject', reason: 'abusive' }, 'token');
    functions.call.and.rejectWith(new Error('Server unavailable'));
    await expectAsync(service.moderate('review', 'approve')).toBeRejectedWithError('Server unavailable');
  });
  it('rejects non-administrators before making a request', async () => {
    profiles.isAdmin.and.returnValue(false);
    await expectAsync(service.list()).toBeRejectedWithError('Administrator access is required.');
  });
});
