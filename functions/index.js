const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
initializeApp();

const actions = { approve: 'active', reject: 'rejected', deactivate: 'deactivated' };

exports.manageUser = onCall(async (request) => {
  if (!request.auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  const db = getFirestore();
  const actor = await db.doc(`users/${request.auth.uid}`).get();
  if (request.auth.token.admin !== true || !actor.exists || actor.get('status') !== 'active') {
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }
  const { userId, action, reason } = request.data || {};
  if (typeof userId !== 'string' || !actions[action]) throw new HttpsError('invalid-argument', 'A valid user and action are required.');
  if (reason != null && (typeof reason !== 'string' || reason.length > 500)) throw new HttpsError('invalid-argument', 'Reason must be at most 500 characters.');

  await db.runTransaction(async (transaction) => {
    const userRef = db.doc(`users/${userId}`);
    const contractorRef = db.doc(`contractors/${userId}`);
    const user = await transaction.get(userRef);
    if (!user.exists) throw new HttpsError('not-found', 'User was not found.');
    const previous = user.get('status');
    const target = actions[action];
    if (action === 'approve' && previous !== 'pending') throw new HttpsError('failed-precondition', 'Only pending accounts can be approved.');
    if (action === 'reject' && previous !== 'pending') throw new HttpsError('failed-precondition', 'Only pending accounts can be rejected.');
    if (action === 'deactivate' && previous !== 'active') throw new HttpsError('failed-precondition', 'Only active accounts can be deactivated.');
    const now = Timestamp.now();
    const patch = { status: target, updatedAt: now };
    if (action === 'approve') Object.assign(patch, { approvedAt: now, approvedBy: request.auth.uid });
    if (action === 'deactivate') Object.assign(patch, { deactivatedAt: now, deactivatedBy: request.auth.uid });
    transaction.update(userRef, patch);

    if (user.get('role') === 'contractor') {
      const contractor = await transaction.get(contractorRef);
      if (!contractor.exists) throw new HttpsError('failed-precondition', 'Contractor profile is missing.');
      transaction.update(contractorRef, { status: target, hireable: target === 'active', updatedAt: now });
    }
    const auditRef = db.collection('userTransitionAudits').doc();
    transaction.create(auditRef, { id: auditRef.id, userId, contractorId: user.get('role') === 'contractor' ? userId : null,
      action: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'deactivated', fromStatus: previous,
      toStatus: target, actorId: request.auth.uid, occurredAt: now, reason: reason || null, createdAt: now, updatedAt: now });
  });

  // Disable rejected/deactivated identities so new sign-ins fail. Rules consult the
  // live user status on every protected request, blocking already-issued tokens.
  await getAuth().updateUser(userId, { disabled: action !== 'approve' });
  if (action !== 'approve') await getAuth().revokeRefreshTokens(userId);
  return { ok: true };
});

// Billing/admin integrations call this endpoint after independently verifying the
// payment. Browser-written profile fields can never grant paid or admin access.
exports.setUserPrivileges = onCall(async (request) => {
  if (!request.auth || request.auth.token.admin !== true) {
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }
  const { userId, admin, paidResident } = request.data || {};
  if (typeof userId !== 'string' || typeof admin !== 'boolean' || typeof paidResident !== 'boolean') {
    throw new HttpsError('invalid-argument', 'User and boolean privilege values are required.');
  }
  const db = getFirestore();
  const [actor, target] = await Promise.all([db.doc(`users/${request.auth.uid}`).get(), db.doc(`users/${userId}`).get()]);
  if (!actor.exists || actor.get('status') !== 'active') throw new HttpsError('permission-denied', 'Active administrator access is required.');
  if (!target.exists || target.get('status') !== 'active') throw new HttpsError('failed-precondition', 'Privileges require an active account.');
  if (admin && target.get('role') !== 'admin') throw new HttpsError('failed-precondition', 'Administrator claims require a backend-managed admin profile.');
  if (paidResident && target.get('role') !== 'paid_resident') throw new HttpsError('failed-precondition', 'Paid membership requires a paid-resident profile.');
  const identity = await getAuth().getUser(userId);
  await getAuth().setCustomUserClaims(userId, { ...identity.customClaims, admin, paidResident });
  await getAuth().revokeRefreshTokens(userId);
  return { ok: true };
});

async function requireResident(db, auth) {
  if (!auth) throw new HttpsError('unauthenticated', 'Sign in is required.');
  const resident = await db.doc(`users/${auth.uid}`).get();
  if (!resident.exists || resident.get('status') !== 'active' || !['resident', 'paid_resident'].includes(resident.get('role'))) {
    throw new HttpsError('permission-denied', 'An active resident account is required.');
  }
  return resident;
}

exports.createJobRequest = onCall(async (request) => {
  const db = getFirestore();
  await requireResident(db, request.auth);
  const { contractorId, categoryId, title, description, budget, scheduledDate } = request.data || {};
  if (![contractorId, categoryId, title, description].every((value) => typeof value === 'string' && value.trim())) {
    throw new HttpsError('invalid-argument', 'Contractor, category, title, and description are required.');
  }
  if (budget != null && (typeof budget !== 'number' || !Number.isFinite(budget) || budget < 0)) {
    throw new HttpsError('invalid-argument', 'Budget must be a non-negative number.');
  }
  const contractor = await db.doc(`contractors/${contractorId}`).get();
  if (!contractor.exists || contractor.get('status') !== 'active' || contractor.get('approvalStatus') !== 'approved'
      || contractor.get('jobAvailability') !== 'available' || contractor.get('profileVisibility') !== 'public') {
    throw new HttpsError('failed-precondition', 'This contractor is not approved and available for hiring.');
  }
  if (contractor.get('userId') === request.auth.uid) throw new HttpsError('permission-denied', 'You cannot hire yourself.');
  const now = Timestamp.now().toDate().toISOString();
  const ref = db.collection('jobs').doc();
  const job = { id: ref.id, residentId: request.auth.uid, contractorId, categoryId, title: title.trim(),
    description: description.trim(), status: 'open', createdAt: now, updatedAt: now,
    ...(budget == null ? {} : { budget }), ...(scheduledDate == null ? {} : { scheduledDate }) };
  await ref.create(job);
  return job;
});

exports.createReview = onCall(async (request) => {
  const db = getFirestore();
  await requireResident(db, request.auth);
  const { jobId, rating, title, comment } = request.data || {};
  if (typeof jobId !== 'string' || !jobId || !Number.isInteger(rating) || rating < 1 || rating > 5
      || typeof comment !== 'string' || !comment.trim() || comment.length > 2000
      || (title != null && (typeof title !== 'string' || title.length > 120))) {
    throw new HttpsError('invalid-argument', 'A job, 1–5 rating, and comment are required.');
  }
  return db.runTransaction(async (transaction) => {
    const jobRef = db.doc(`jobs/${jobId}`);
    // A deterministic per-job id makes the one-review invariant transaction-safe.
    const reviewRef = db.doc(`reviews/${jobId}`);
    const [job, existing] = await Promise.all([transaction.get(jobRef), transaction.get(reviewRef)]);
    if (!job.exists || job.get('status') !== 'completed') throw new HttpsError('failed-precondition', 'Only completed jobs can be reviewed.');
    if (job.get('residentId') !== request.auth.uid) throw new HttpsError('permission-denied', 'Only the resident who owns this job can review it.');
    const contractorId = job.get('contractorId');
    if (!contractorId || contractorId === request.auth.uid) throw new HttpsError('permission-denied', 'Contractors cannot review themselves.');
    if (existing.exists) throw new HttpsError('already-exists', 'This job has already been reviewed.');
    const contractorRef = db.doc(`contractors/${contractorId}`);
    const contractor = await transaction.get(contractorRef);
    if (!contractor.exists) throw new HttpsError('not-found', 'Contractor was not found.');
    const previousCount = contractor.get('reviewCount') || 0;
    const previousRating = contractor.get('rating') || 0;
    const reviewCount = previousCount + 1;
    const aggregateRating = ((previousRating * previousCount) + rating) / reviewCount;
    const now = Timestamp.now().toDate().toISOString();
    const review = { id: jobId, jobId, contractorId, residentId: request.auth.uid, rating,
      comment: comment.trim(), ...(title ? { title: title.trim() } : {}), createdAt: now, updatedAt: now };
    transaction.create(reviewRef, review);
    transaction.update(contractorRef, { rating: aggregateRating, reviewCount, updatedAt: now });
    return review;
  });
});
