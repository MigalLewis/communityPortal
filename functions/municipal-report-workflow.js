'use strict';

const reportTransitions = { submitted: ['assigned', 'closed'], assigned: ['in_progress', 'closed'], in_progress: ['resolved', 'closed'], resolved: ['in_progress', 'closed'], closed: [] };

function isAllowedReportTransition(from, to) {
  return from === to || Boolean(reportTransitions[from]?.includes(to));
}

function buildReportAudit(id, reportId, administratorId, occurredAt, priorState, newState, note) {
  return Object.freeze({ id, reportId, administratorId, occurredAt,
    priorState: Object.freeze({ ...priorState }), newState: Object.freeze({ ...newState }), note: note || null });
}

module.exports = { buildReportAudit, isAllowedReportTransition };
