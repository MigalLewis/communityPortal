const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { createHash } = require('node:crypto');
initializeApp();

const contactSubjects = new Set(['General enquiry', 'Membership', 'Municipal issue', 'Security',
  'Town Planning & Heritage', 'Community project', 'Website feedback', 'Other']);

const reportCategories = new Set(['roads', 'water', 'electricity', 'waste', 'parks', 'stormwater', 'other']);
const reportEntities = new Set(['Johannesburg Roads Agency', 'Johannesburg Water', 'City Power', 'Pikitup', 'Johannesburg City Parks', 'Other / unsure']);
const reportTransitions = { submitted: ['assigned', 'closed'], assigned: ['in_progress', 'closed'], in_progress: ['resolved', 'closed'], resolved: ['in_progress', 'closed'], closed: [] };

function contactText(value, field, max, required = true) {
  if (value == null && !required) return '';
  if (typeof value !== 'string') throw new HttpsError('invalid-argument', `${field} is invalid.`);
  const normalized = value.normalize('NFKC').replace(/\r\n?/g, '\n').trim();
  if ((required && !normalized) || normalized.length > max || /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(normalized)) {
    throw new HttpsError('invalid-argument', `${field} is invalid.`);
  }
  return normalized;
}

// Membership is required so ownership and status visibility remain reliable.
// Anonymous clients receive unauthenticated and can resume their locally saved draft after login.
exports.submitMunicipalReport = onCall(async (request) => {
  const db = getFirestore();
  await requireResident(db, request.auth);
  const contentLength = Number(request.rawRequest?.get('content-length') || 0);
  if (contentLength > 20000) throw new HttpsError('invalid-argument', 'Submission is too large.');
  const input = request.data || {};
  const category = contactText(input.category, 'Category', 30);
  const entity = contactText(input.entity, 'Municipal entity', 80);
  const location = contactText(input.location, 'Location', 250);
  const description = contactText(input.description, 'Description', 4000);
  const cityReference = contactText(input.cityReference, 'City reference', 80, false);
  if (!reportCategories.has(category) || !reportEntities.has(entity) || description.length < 20
      || !['email', 'phone', 'none'].includes(input.contactPreference)) {
    throw new HttpsError('invalid-argument', 'Report details are invalid.');
  }
  if (!Array.isArray(input.attachments) || input.attachments.length > 5) throw new HttpsError('invalid-argument', 'Too many attachments.');
  const attachments = input.attachments.map((item) => {
    if (!item || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 180
        || !['image/jpeg', 'image/png', 'application/pdf'].includes(item.contentType)
        || !Number.isInteger(item.size) || item.size < 1 || item.size > 5_000_000
        || item.storagePath != null) throw new HttpsError('invalid-argument', 'Attachment metadata is invalid.');
    return { name: item.name.trim(), contentType: item.contentType, size: item.size };
  });
  const now = Timestamp.now();
  const forwarded = request.rawRequest?.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0] : request.rawRequest?.ip) || 'unknown';
  const fingerprint = createHash('sha256').update(`report:${request.auth.uid}:${ip}`).digest('hex');
  const limitRef = db.doc(`municipalReportRateLimits/${fingerprint}`);
  const reportRef = db.collection('municipalReports').doc();
  const referenceNumber = `PNRA-${now.toDate().getUTCFullYear()}-${reportRef.id.slice(0, 8).toUpperCase()}`;
  await db.runTransaction(async (transaction) => {
    const limit = await transaction.get(limitRef); const start = limit.get('windowStart');
    const active = start && now.toMillis() - start.toMillis() < 60 * 60 * 1000;
    const count = active ? (limit.get('count') || 0) : 0;
    if (count >= 5) throw new HttpsError('resource-exhausted', 'Too many reports. Please try again later.');
    transaction.set(limitRef, { windowStart: active ? start : now, count: count + 1, updatedAt: now });
    transaction.create(reportRef, { id: reportRef.id, referenceNumber, ownerId: request.auth.uid, category, entity,
      location, description, cityReference: cityReference || null, contactPreference: input.contactPreference,
      attachments, status: 'submitted', assigneeId: null, createdAt: now, updatedAt: now });
  });
  return { reportId: reportRef.id, referenceNumber };
});

exports.manageMunicipalReport = onCall(async (request) => {
  const db = getFirestore();
  if (!request.auth || request.auth.token.admin !== true) throw new HttpsError('permission-denied', 'Administrator access is required.');
  const actor = await db.doc(`users/${request.auth.uid}`).get();
  if (!actor.exists || actor.get('status') !== 'active') throw new HttpsError('permission-denied', 'Active administrator access is required.');
  const { reportId, status } = request.data || {};
  const assigneeId = contactText(request.data?.assigneeId, 'Assignee', 128, false);
  const resolutionNote = contactText(request.data?.resolutionNote, 'Resolution note', 2000, false);
  if (typeof reportId !== 'string' || !Object.hasOwn(reportTransitions, status)) throw new HttpsError('invalid-argument', 'Report and status are required.');
  await db.runTransaction(async (transaction) => {
    const ref = db.doc(`municipalReports/${reportId}`); const report = await transaction.get(ref);
    if (!report.exists) throw new HttpsError('not-found', 'Report was not found.');
    if (!reportTransitions[report.get('status')]?.includes(status)) throw new HttpsError('failed-precondition', 'That status transition is not allowed.');
    if (['assigned', 'in_progress'].includes(status) && !assigneeId) throw new HttpsError('invalid-argument', 'An assignee is required.');
    if (['resolved', 'closed'].includes(status) && !resolutionNote) throw new HttpsError('invalid-argument', 'A closing note is required.');
    transaction.update(ref, { status, assigneeId: assigneeId || report.get('assigneeId') || null,
      resolutionNote: resolutionNote || null, updatedAt: Timestamp.now(), updatedBy: request.auth.uid });
  });
  return { ok: true };
});

// Public callable contact form. The callable protocol, strict validation,
// honeypot, payload cap, and transaction-backed IP limit protect the only write
// path; Firestore rules prevent browsers from accessing the stored enquiries.
exports.submitContactEnquiry = onCall(async (request) => {
  const contentLength = Number(request.rawRequest?.get('content-length') || 0);
  if (contentLength > 12000) throw new HttpsError('invalid-argument', 'Submission is too large.');
  const input = request.data || {};
  if (typeof input.website === 'string' && input.website.trim()) {
    throw new HttpsError('invalid-argument', 'Submission could not be accepted.');
  }
  const name = contactText(input.name, 'Name', 100);
  const email = contactText(input.email, 'Email', 254).toLowerCase();
  const phone = contactText(input.phone, 'Phone', 30, false);
  const subject = contactText(input.subject, 'Subject', 80);
  const message = contactText(input.message, 'Message', 5000);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || (phone && !/^\+?[0-9 ()-]{7,30}$/.test(phone))
      || !contactSubjects.has(subject)) {
    throw new HttpsError('invalid-argument', 'Submission contains invalid contact details.');
  }

  const db = getFirestore();
  const forwarded = request.rawRequest?.get('x-forwarded-for');
  const ip = (forwarded ? forwarded.split(',')[0] : request.rawRequest?.ip) || 'unknown';
  const fingerprint = createHash('sha256').update(`contact:${ip}`).digest('hex');
  const limitRef = db.doc(`contactRateLimits/${fingerprint}`);
  const now = Timestamp.now();
  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(limitRef);
    const windowStart = snapshot.get('windowStart');
    const withinWindow = windowStart && now.toMillis() - windowStart.toMillis() < 60 * 60 * 1000;
    const count = withinWindow ? (snapshot.get('count') || 0) : 0;
    if (count >= 3) throw new HttpsError('resource-exhausted', 'Too many messages. Please try again later.');
    transaction.set(limitRef, { windowStart: withinWindow ? windowStart : now, count: count + 1, updatedAt: now });
  });

  const ref = db.collection('contactEnquiries').doc();
  await ref.create({ id: ref.id, name, email, phone: phone || null, subject, message,
    status: 'new', createdAt: now, source: 'website' });
  return { ok: true };
});

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
