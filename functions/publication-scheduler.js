'use strict';

/** Computes the idempotent backend patch for a scheduled content record. */
function schedulingPatch(record, now = new Date()) {
  if (!record || record.publicationMode !== 'scheduled') return null;
  const from = Date.parse(record.visibleFrom); const until = Date.parse(record.visibleUntil);
  if (!Number.isFinite(from) || !Number.isFinite(until) || until <= from) return null;
  const time = now.getTime();
  const state = time < from ? 'pending' : time < until ? 'active' : 'expired';
  const isEvent = Object.prototype.hasOwnProperty.call(record, 'startAt');
  const patch = { schedulingState: state, isPublic: state === 'active' };
  if (isEvent) patch.status = state === 'active' ? 'published' : state === 'expired' ? 'archived' : 'draft';
  else patch.publicationState = state === 'active' ? 'published' : 'draft';
  if (state === 'active' && !record.publishedAt) patch.publishedAt = now.toISOString();
  if (state === 'expired' && !record.archivedAt) patch.archivedAt = now.toISOString();
  const changed = Object.entries(patch).some(([key, value]) => record[key] !== value);
  if (!changed) return null;
  patch.updatedAt = now.toISOString();
  patch.scheduleStateChangedAt = now.toISOString();
  patch.scheduleStateChangeReason = state === 'active' ? 'visibility_window_started' : state === 'expired' ? 'visibility_window_ended' : 'awaiting_visibility_window';
  return patch;
}

async function processScheduledPublications(db, now = new Date()) {
  let changed = 0;
  for (const collection of ['events', 'communityProjects']) {
    const snapshot = await db.collection(collection).where('publicationMode', '==', 'scheduled').get();
    for (const document of snapshot.docs) {
      await db.runTransaction(async transaction => {
        const fresh = await transaction.get(document.ref);
        if (!fresh.exists) return;
        const patch = schedulingPatch(fresh.data(), now);
        if (patch) { transaction.update(document.ref, patch); changed += 1; }
      });
    }
  }
  return changed;
}
module.exports = { schedulingPatch, processScheduledPublications };
