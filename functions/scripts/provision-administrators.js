#!/usr/bin/env node

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const ADMINISTRATORS = [
  { role: 'super_admin', option: 'super-admin-email', nameOption: 'super-admin-name', defaultName: 'Super Administrator' },
  { role: 'admin', option: 'admin-email', nameOption: 'admin-name', defaultName: 'Administrator' }
];

function options(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!argument.startsWith('--')) throw new Error(`Unexpected argument: ${argument}`);
    const [key, inlineValue] = argument.slice(2).split('=', 2);
    const value = inlineValue ?? argv[++index];
    if (!value || value.startsWith('--')) throw new Error(`A value is required for --${key}.`);
    result[key] = value.trim();
  }
  return result;
}

async function existingProfile(db, role) {
  const snapshot = await db.collection('users').where('role', '==', role).where('status', '==', 'active').limit(2).get();
  if (snapshot.size > 1) {
    throw new Error(`More than one active ${role} profile exists. Resolve the duplicate profiles before continuing.`);
  }
  return snapshot.empty ? null : snapshot.docs[0];
}

async function grantClaims(auth, uid, role) {
  const identity = await auth.getUser(uid);
  await auth.setCustomUserClaims(uid, {
    ...(identity.customClaims || {}),
    admin: true,
    superAdmin: role === 'super_admin'
  });
}

async function provision(db, auth, configuration, values) {
  const current = await existingProfile(db, configuration.role);
  if (current) {
    await grantClaims(auth, current.id, configuration.role);
    console.log(`Existing active ${configuration.role} retained (${current.get('email') || current.id}); claims synchronized.`);
    return;
  }

  const email = values[configuration.option];
  if (!email) {
    throw new Error(`No active ${configuration.role} exists. Pass --${configuration.option} for the Firebase Authentication user to provision.`);
  }

  const identity = await auth.getUserByEmail(email);
  const profileRef = db.doc(`users/${identity.uid}`);
  const profile = await profileRef.get();
  if (profile.exists && profile.get('role') !== configuration.role) {
    throw new Error(`${email} already has the ${profile.get('role')} role; refusing to replace it with ${configuration.role}.`);
  }

  await profileRef.set({
    id: identity.uid,
    email: identity.email,
    fullName: values[configuration.nameOption] || identity.displayName || configuration.defaultName,
    role: configuration.role,
    status: 'active',
    membershipStatus: 'none',
    createdAt: profile.get('createdAt') || FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }, { merge: true });
  await grantClaims(auth, identity.uid, configuration.role);
  console.log(`Provisioned ${configuration.role}: ${identity.email} (${identity.uid}).`);
}

async function main() {
  const values = options(process.argv.slice(2));
  initializeApp({ credential: applicationDefault() });
  const db = getFirestore();
  const auth = getAuth();

  for (const configuration of ADMINISTRATORS) {
    await provision(db, auth, configuration, values);
  }
  console.log('Administrator provisioning complete. New claims apply on the users\' next sign-in.');
}

main().catch((error) => {
  console.error(`Administrator provisioning failed: ${error.message}`);
  process.exitCode = 1;
});
