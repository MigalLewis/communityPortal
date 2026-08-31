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
