const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, writeFileSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { projectId, provision, ADMINISTRATORS } = require('./provision-administrators');

test('project selection uses explicit flag, environment, local file, then repository default', () => {
  const root = mkdtempSync(join(tmpdir(), 'provision-test-'));
  try {
    writeFileSync(join(root, '.firebaserc'), JSON.stringify({ projects: { default: 'repository' } }));
    assert.equal(projectId({}, {}, root), 'repository');
    writeFileSync(join(root, '.env.local'), 'FIREBASE_PROJECT_ID="local" # comment\n');
    assert.equal(projectId({}, {}, root), 'local');
    assert.equal(projectId({}, { FIREBASE_PROJECT_ID: 'environment' }, root), 'environment');
    assert.equal(projectId({ project: 'explicit' }, { FIREBASE_PROJECT_ID: 'environment' }, root), 'explicit');
  } finally { rmSync(root, { recursive: true }); }
});

function fixture(existing = null, initial = null) {
  let data = initial;
  let writeCount = 0;
  let claims = null;
  const snapshot = () => ({ exists: !!data, get: (key) => data?.[key] });
  const reference = { get: async () => snapshot(), set: async (value) => { data = { ...data, ...value }; writeCount++; } };
  const query = { where: () => query, limit: () => query, get: async () => ({ size: existing ? 1 : 0, empty: !existing, docs: existing ? [existing] : [] }) };
  const db = { collection: () => query, doc: (path) => { assert.equal(path, 'users/actual-uid'); return reference; } };
  const auth = {
    getUserByEmail: async (email) => { assert.equal(email, 'actual@example.com'); return { uid: 'actual-uid', email }; },
    getUser: async () => ({ customClaims: { unrelated: true } }),
    setCustomUserClaims: async (_uid, value) => { claims = value; }
  };
  return { db, auth, data: () => data, writes: () => writeCount, claims: () => claims };
}

for (const configuration of ADMINISTRATORS) {
  test(`creates and verifies the ${configuration.role} profile without a supplied name`, async () => {
    const f = fixture();
    await provision(f.db, f.auth, configuration, { [configuration.option]: 'actual@example.com' }, () => 'timestamp');
    assert.equal(f.data().fullName, configuration.defaultName);
    assert.equal(f.data().status, 'active');
    assert.equal(f.data().role, configuration.role);
    assert.equal(f.claims().admin, true);
    assert.equal(f.claims().superAdmin, configuration.role === 'super_admin');
    assert.equal(f.claims().unrelated, true);
  });
}

test('refuses to silently provision an existing administrator instead of the supplied email', async () => {
  const f = fixture({ id: 'another-uid' });
  await assert.rejects(provision(f.db, f.auth, ADMINISTRATORS[1], { 'admin-email': 'actual@example.com' }, () => 'timestamp'), /different account/);
  assert.equal(f.writes(), 0);
  assert.equal(f.claims(), null);
});

test('rerunning for the same administrator repairs fields and preserves creation time', async () => {
  const f = fixture({ id: 'actual-uid' }, { role: 'admin', createdAt: 'original' });
  await provision(f.db, f.auth, ADMINISTRATORS[1], { 'admin-email': 'actual@example.com' }, () => 'timestamp');
  assert.equal(f.data().createdAt, 'original');
  assert.equal(f.data().status, 'active');
});

test('refuses to overwrite an existing different role', async () => {
  const f = fixture(null, { role: 'resident' });
  await assert.rejects(provision(f.db, f.auth, ADMINISTRATORS[1], { 'admin-email': 'actual@example.com' }, () => 'timestamp'), /refusing to replace/);
  assert.equal(f.writes(), 0);
});
