#!/usr/bin/env node

const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

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

async function provision(db, auth, configuration, values, timestamp) {
  const email = values[configuration.option];
  if (!email) {
    throw new Error(`Pass --${configuration.option} for the existing Firebase Authentication user to provision.`);
  }
  const identity = await auth.getUserByEmail(email);
  const current = await existingProfile(db, configuration.role);
  if (current && current.id !== identity.uid) {
    throw new Error(`An active ${configuration.role} already exists for a different account. Refusing to ignore the supplied email or replace that administrator.`);
  }
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
    createdAt: profile.get('createdAt') || timestamp(),
    updatedAt: timestamp()
  }, { merge: true });
  await grantClaims(auth, identity.uid, configuration.role);
  const verified = await profileRef.get();
  if (!verified.exists || verified.get('role') !== configuration.role || verified.get('status') !== 'active') {
    throw new Error(`Profile verification failed for users/${identity.uid}.`);
  }
  console.log(`Verified active profile: users/${identity.uid}`);
  console.log(`Provisioned ${configuration.role}: ${identity.email} (${identity.uid}).`);
}

function projectId(values, environment = process.env, root = resolve(__dirname, '../..')) {
  if (values.project) return values.project;
  if (environment.FIREBASE_PROJECT_ID?.trim()) return environment.FIREBASE_PROJECT_ID.trim();
  try {
    const local = readFileSync(resolve(root, '.env.local'), 'utf8');
    const match = local.match(/^\s*(?:export\s+)?FIREBASE_PROJECT_ID\s*=\s*(.*?)\s*$/m);
    if (match) {
      const value = match[1].replace(/\s+#.*$/, '').replace(/^(['"])(.*)\1$/, '$2').trim();
      if (value && !value.startsWith('YOUR_')) return value;
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const configuration = JSON.parse(readFileSync(resolve(root, '.firebaserc'), 'utf8'));
  if (!configuration.projects?.default) throw new Error('Specify the Firebase project with --project or FIREBASE_PROJECT_ID.');
  return configuration.projects.default;
}

async function main() {
  const values = options(process.argv.slice(2));
  for (const configuration of ADMINISTRATORS) {
    if (!values[configuration.option]) throw new Error(`Pass --${configuration.option} with the actual Firebase Authentication email.`);
  }
  if (values['admin-email'].toLowerCase() === values['super-admin-email'].toLowerCase()) {
    throw new Error('Admin and super-admin must be different Authentication users.');
  }
  const targetProject = projectId(values);
  // ADC and Google Cloud clients also discover the project from the environment.
  // Keep credential discovery aligned with the explicit Firebase app project.
  process.env.GOOGLE_CLOUD_PROJECT = targetProject;
  console.log(`Firebase project: ${targetProject}; Firestore database: (default)`);
  if (process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    console.log('Emulator environment detected: writes may target local emulators rather than Firebase Console.');
  }
  const { initializeApp, applicationDefault } = require('firebase-admin/app');
  const { getAuth } = require('firebase-admin/auth');
  const { getFirestore, FieldValue } = require('firebase-admin/firestore');
  const app = initializeApp({ credential: applicationDefault(), projectId: targetProject });
  const db = getFirestore(app);
  const auth = getAuth(app);

  for (const configuration of ADMINISTRATORS) {
    await provision(db, auth, configuration, values, () => FieldValue.serverTimestamp());
  }
  console.log('Administrator provisioning complete. Sign out and back in to receive the new claims.');
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Administrator provisioning failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { projectId, provision, ADMINISTRATORS };
