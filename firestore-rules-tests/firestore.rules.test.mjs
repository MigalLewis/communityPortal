import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';

const projectId = 'community-portal-rules-test';
const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
let env;

const user = (id, role, status = 'active', extra = {}) => ({
  id, email: `${id}@example.test`, fullName: id, role, status,
  membershipStatus: role === 'paid_resident' ? 'active' : 'none', createdAt: '2026-01-01', ...extra
});
const contractorProfile = (id, extra = {}) => ({
  id, userId: id, fullName: id, businessName: `${id} Services`, categoryIds: ['repairs'], services: ['Repair'], serviceAreas: ['Central'],
  status: 'active', approvalStatus: 'approved', verified: true, jobAvailability: 'available', profileVisibility: 'public',
  contactPreferences: { preferredMethod: 'platform' }, portfolioMedia: [],
  rating: 4, reviewCount: 2, createdAt: '2026-01-01', ...extra
});
const authed = (id, claims = {}) => env.authenticatedContext(id, { email: `${id}@example.test`, ...claims }).firestore();
const anon = () => env.unauthenticatedContext().firestore();

async function seed() {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, 'users/resident'), user('resident', 'resident')),
      setDoc(doc(db, 'users/paid'), user('paid', 'paid_resident')),
      setDoc(doc(db, 'users/contractor'), user('contractor', 'contractor')),
      setDoc(doc(db, 'users/outsider'), user('outsider', 'resident')),
      setDoc(doc(db, 'users/admin'), user('admin', 'admin')),
      setDoc(doc(db, 'contractors/contractor'), contractorProfile('contractor')),
      setDoc(doc(db, 'contractors/private'), contractorProfile('private', { profileVisibility: 'hidden' })),
      setDoc(doc(db, 'serviceProviders/public'), { id: 'public', status: 'active', approved: true, isPublic: true }),
      setDoc(doc(db, 'serviceProviders/unapproved'), { id: 'unapproved', status: 'active', approved: false, isPublic: true }),
      setDoc(doc(db, 'categories/active'), { id: 'active', isActive: true }),
      setDoc(doc(db, 'categories/inactive'), { id: 'inactive', isActive: false }),
      setDoc(doc(db, 'adverts/public'), { id: 'public', status: 'active', isPublic: true }),
      setDoc(doc(db, 'adverts/draft'), { id: 'draft', status: 'draft', isPublic: true }),
      setDoc(doc(db, 'jobs/job'), { id: 'job', residentId: 'resident', contractorId: 'contractor', status: 'completed', createdAt: '2026-01-01' }),
      setDoc(doc(db, 'jobs/incomplete'), { id: 'incomplete', residentId: 'resident', contractorId: 'contractor', status: 'in_progress', createdAt: '2026-01-01' }),
      setDoc(doc(db, 'reviews/review'), { id: 'review', jobId: 'job', residentId: 'resident', contractorId: 'contractor', rating: 5 }),
      setDoc(doc(db, 'messageThreads/thread'), { id: 'thread', participantIds: ['resident', 'contractor'], createdAt: '2026-01-01' }),
      setDoc(doc(db, 'applications/application'), { id: 'application', applicantId: 'resident', contractorId: 'contractor', jobId: 'job', status: 'pending' }),
      setDoc(doc(db, 'payments/payment'), { id: 'payment', userId: 'resident', amount: 100 }),
      setDoc(doc(db, 'userTransitionAudits/audit'), { id: 'audit', userId: 'resident' })
    ]);
  });
}

before(async () => { env = await initializeTestEnvironment({ projectId, firestore: { rules } }); });
beforeEach(async () => { await env.clearFirestore(); await seed(); });
after(async () => { await env.cleanup(); });

describe('public visibility is explicitly scoped', () => {
  test('permits approved active public directory data and adverts', async () => {
    await assertSucceeds(getDoc(doc(anon(), 'contractors/contractor')));
    await assertSucceeds(getDoc(doc(anon(), 'serviceProviders/public')));
    await assertSucceeds(getDoc(doc(anon(), 'categories/active')));
    await assertSucceeds(getDoc(doc(anon(), 'adverts/public')));
  });
  test('denies private/inactive directory records and sensitive collections', async () => {
    for (const path of ['contractors/private', 'serviceProviders/unapproved', 'categories/inactive', 'adverts/draft',
      'users/resident', 'jobs/job', 'reviews/review', 'messageThreads/thread', 'applications/application',
      'payments/payment', 'userTransitionAudits/audit']) {
      await assertFails(getDoc(doc(anon(), path)));
    }
  });
  test('requires public predicates in list queries', async () => {
    await assertSucceeds(getDocs(query(collection(anon(), 'categories'), where('isActive', '==', true))));
    await assertSucceeds(getDocs(query(collection(anon(), 'contractors'), where('status', '==', 'active'), where('approvalStatus', '==', 'approved'), where('profileVisibility', '==', 'public'))));
    await assertFails(getDocs(query(collection(anon(), 'contractors'), where('status', '==', 'active'))));
    await assertFails(getDocs(collection(anon(), 'categories')));
  });
});

describe('registration and profile escalation defenses', () => {
  test('allows each safe public role to create only its own initial document', async () => {
    for (const [id, role, status, membershipStatus] of [
      ['new-resident', 'resident', 'active', 'none'], ['new-paid', 'paid_resident', 'pending', 'pending'],
      ['new-contractor', 'contractor', 'pending', 'none']
    ]) {
      await assertSucceeds(setDoc(doc(authed(id), `users/${id}`), user(id, role, status, { membershipStatus })));
    }
  });
  test('denies admin role, wrong owner, self approval, paid status, and protected fields', async () => {
    await assertFails(setDoc(doc(authed('evil'), 'users/evil'), user('evil', 'admin')));
    await assertFails(setDoc(doc(authed('evil'), 'users/victim'), user('victim', 'resident')));
    await assertFails(setDoc(doc(authed('pending'), 'users/pending'), user('pending', 'contractor', 'active')));
    await assertFails(setDoc(doc(authed('evil-paid'), 'users/evil-paid'), user('evil-paid', 'paid_resident', 'pending', { membershipStatus: 'active' })));
    await assertFails(updateDoc(doc(authed('resident'), 'users/resident'), { role: 'admin' }));
    await assertFails(updateDoc(doc(authed('resident'), 'users/resident'), { status: 'active', membershipStatus: 'active' }));
  });
  test('allows resident profile fields but not contractor-only or membership fields', async () => {
    await assertSucceeds(updateDoc(doc(authed('resident'), 'users/resident'), { fullName: 'Updated', phone: '123' }));
    await assertSucceeds(updateDoc(doc(authed('paid'), 'users/paid'), { avatarUrl: 'avatar.png' }));
    await assertFails(updateDoc(doc(authed('resident'), 'users/resident'), { businessName: 'Escalation Ltd' }));
    await assertFails(updateDoc(doc(authed('paid'), 'users/paid'), { membershipStatus: 'active' }));
  });
  test('contractors can edit presentation fields but not trust, rating, or ownership', async () => {
    await assertSucceeds(updateDoc(doc(authed('contractor'), 'contractors/contractor'), { bio: 'New bio' }));
    for (const patch of [{ verified: false }, { approvalStatus: 'rejected' }, { rating: 5 }, { reviewCount: 99 },
      { userId: 'outsider' }, { status: 'active' }]) {
      await assertFails(updateDoc(doc(authed('contractor'), 'contractors/contractor'), patch));
    }
    await assertSucceeds(updateDoc(doc(authed('contractor'), 'contractors/contractor'), { jobAvailability: 'unavailable', profileVisibility: 'hidden', services: ['Repair', 'Install'] }));
    await env.withSecurityRulesDisabled(async (context) => updateDoc(doc(context.firestore(), 'contractors/contractor'), { approvalStatus: 'rejected' }));
    await assertFails(updateDoc(doc(authed('contractor'), 'contractors/contractor'), { bio: 'Rejected cannot edit' }));
  });
});

describe('trusted administrators', () => {
  test('uses claims rather than a profile role and manages accounts and adverts', async () => {
    await assertSucceeds(updateDoc(doc(authed('admin', { admin: true }), 'users/resident'), { status: 'deactivated' }));
    await assertSucceeds(setDoc(doc(authed('admin', { admin: true }), 'adverts/new'), { id: 'new', status: 'active', isPublic: true }));
    await assertFails(updateDoc(doc(authed('admin'), 'users/resident'), { status: 'deactivated' }));
  });
});

describe('participant collections and immutable ownership', () => {
  test('limits jobs and reviews to their participants', async () => {
    await assertSucceeds(getDoc(doc(authed('resident'), 'jobs/job')));
    await assertSucceeds(getDoc(doc(authed('contractor'), 'reviews/review')));
    await assertFails(getDoc(doc(authed('outsider'), 'jobs/job')));
    await assertFails(getDoc(doc(authed('outsider'), 'reviews/review')));
    await assertFails(updateDoc(doc(authed('resident'), 'jobs/job'), { residentId: 'outsider' }));
    await assertFails(setDoc(doc(authed('resident'), 'reviews/new'), { id: 'new', jobId: 'job', residentId: 'resident', contractorId: 'contractor', rating: 4 }));
    await assertFails(setDoc(doc(authed('outsider'), 'reviews/forged'), { id: 'forged', jobId: 'job', residentId: 'outsider', contractorId: 'contractor', rating: 5 }));
  });
  test('limits threads, messages, and applications to participants', async () => {
    await assertSucceeds(getDoc(doc(authed('resident'), 'messageThreads/thread')));
    await assertFails(getDoc(doc(authed('outsider'), 'messageThreads/thread')));
    await assertFails(updateDoc(doc(authed('resident'), 'messageThreads/thread'), { participantIds: ['resident', 'outsider'] }));
    await assertSucceeds(setDoc(doc(authed('resident'), 'messageThreads/thread/messages/message'), { id: 'message', senderId: 'resident', content: 'Hello' }));
    await assertFails(setDoc(doc(authed('resident'), 'messageThreads/thread/messages/forged'), { id: 'forged', senderId: 'contractor', content: 'Forged' }));
    await assertSucceeds(getDoc(doc(authed('contractor'), 'applications/application')));
    await assertFails(getDoc(doc(authed('outsider'), 'applications/application')));
    await assertFails(updateDoc(doc(authed('resident'), 'applications/application'), { applicantId: 'outsider' }));
  });
  test('keeps payments private and browser-immutable', async () => {
    await assertSucceeds(getDoc(doc(authed('resident'), 'payments/payment')));
    await assertFails(getDoc(doc(authed('outsider'), 'payments/payment')));
    await assertFails(updateDoc(doc(authed('resident'), 'payments/payment'), { amount: 0 }));
    await assertFails(deleteDoc(doc(authed('resident'), 'payments/payment')));
  });
});

describe('job and review writes require the trusted services', () => {
  test('denies anonymous job and review creation', async () => {
    await assertFails(setDoc(doc(anon(), 'jobs/anonymous'), { id: 'anonymous', residentId: 'resident', contractorId: 'contractor', status: 'open' }));
    await assertFails(setDoc(doc(anon(), 'reviews/anonymous'), { id: 'anonymous', jobId: 'job', residentId: 'resident', contractorId: 'contractor', rating: 5 }));
  });
  test('denies incomplete, duplicate, non-owner, and contractor self-review browser writes', async () => {
    await assertFails(setDoc(doc(authed('resident'), 'reviews/incomplete'), { id: 'incomplete', jobId: 'incomplete', residentId: 'resident', contractorId: 'contractor', rating: 5 }));
    await assertFails(setDoc(doc(authed('resident'), 'reviews/job'), { id: 'job', jobId: 'job', residentId: 'resident', contractorId: 'contractor', rating: 5 }));
    await assertFails(setDoc(doc(authed('outsider'), 'reviews/outsider'), { id: 'outsider', jobId: 'job', residentId: 'outsider', contractorId: 'contractor', rating: 5 }));
    await assertFails(setDoc(doc(authed('contractor'), 'reviews/self'), { id: 'self', jobId: 'job', residentId: 'contractor', contractorId: 'contractor', rating: 5 }));
  });
  test('prevents clients from forging contractor aggregates', async () => {
    await assertFails(updateDoc(doc(authed('resident'), 'contractors/contractor'), { rating: 5, reviewCount: 3 }));
    await assertFails(updateDoc(doc(authed('contractor'), 'contractors/contractor'), { rating: 5, reviewCount: 3 }));
  });
});

test('no unmatched collection is exposed', async () => {
  await assertFails(setDoc(doc(authed('resident'), 'internalSecrets/secret'), { public: true }));
  assert.ok(true);
});
