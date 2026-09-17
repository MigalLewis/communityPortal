const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReportAudit, isAllowedReportTransition } = require('./municipal-report-workflow');

test('municipal report transitions permit only configured forward moves or an edit in place', () => {
  assert.equal(isAllowedReportTransition('submitted', 'assigned'), true);
  assert.equal(isAllowedReportTransition('submitted', 'resolved'), false);
  assert.equal(isAllowedReportTransition('closed', 'closed'), true);
  assert.equal(isAllowedReportTransition('closed', 'in_progress'), false);
});

test('municipal report audit records actor, time, prior/new state and note immutably', () => {
  const occurredAt = { seconds: 42 };
  const audit = buildReportAudit('audit-1', 'report-1', 'admin-1', occurredAt,
    { status: 'submitted', assigneeId: null }, { status: 'assigned', assigneeId: 'admin-1' }, 'Taking ownership');
  assert.deepEqual(audit, { id: 'audit-1', reportId: 'report-1', administratorId: 'admin-1', occurredAt,
    priorState: { status: 'submitted', assigneeId: null }, newState: { status: 'assigned', assigneeId: 'admin-1' }, note: 'Taking ownership' });
  assert.equal(Object.isFrozen(audit), true); assert.equal(Object.isFrozen(audit.priorState), true); assert.equal(Object.isFrozen(audit.newState), true);
});
