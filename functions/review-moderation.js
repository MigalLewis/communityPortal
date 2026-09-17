'use strict';

const transitions = {
  pending: { approve: 'approved', reject: 'rejected', remove: null },
  approved: { reject: 'rejected', remove: null },
  rejected: { restore: 'approved', approve: 'approved', remove: null }
};

function validateReviewTransition(current, action, reason = '') {
  if (!Object.hasOwn(transitions, current) || !Object.hasOwn(transitions[current], action)) {
    throw new Error('That moderation transition is not allowed.');
  }
  if (['reject', 'remove'].includes(action) && !reason.trim()) {
    throw new Error('A moderation reason is required.');
  }
  return transitions[current][action];
}

function aggregateAfterTransition(rating, count, reviewRating, from, to) {
  const wasIncluded = from === 'approved';
  const willBeIncluded = to === 'approved';
  if (wasIncluded === willBeIncluded) return { rating, reviewCount: count };
  if (willBeIncluded) {
    const reviewCount = count + 1;
    return { rating: ((rating * count) + reviewRating) / reviewCount, reviewCount };
  }
  const reviewCount = Math.max(0, count - 1);
  return { rating: reviewCount ? ((rating * count) - reviewRating) / reviewCount : 0, reviewCount };
}

module.exports = { aggregateAfterTransition, validateReviewTransition };
