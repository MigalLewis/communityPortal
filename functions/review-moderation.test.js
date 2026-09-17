const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { aggregateAfterTransition, validateReviewTransition } = require('./review-moderation');

describe('review moderation transitions', () => {
  it('allows pending approval/rejection and rejected restoration', () => {
    assert.equal(validateReviewTransition('pending', 'approve'), 'approved');
    assert.equal(validateReviewTransition('pending', 'reject', 'Spam'), 'rejected');
    assert.equal(validateReviewTransition('rejected', 'restore'), 'approved');
  });
  it('rejects invalid transitions and missing destructive reasons', () => {
    assert.throws(() => validateReviewTransition('approved', 'approve'), /not allowed/);
    assert.throws(() => validateReviewTransition('pending', 'reject'), /reason is required/);
    assert.throws(() => validateReviewTransition('approved', 'remove'), /reason is required/);
  });
});

describe('rating aggregate consistency', () => {
  it('adds a newly approved or restored review', () => {
    assert.deepEqual(aggregateAfterTransition(4, 2, 5, 'pending', 'approved'), { rating: 13 / 3, reviewCount: 3 });
    assert.deepEqual(aggregateAfterTransition(4, 2, 2, 'rejected', 'approved'), { rating: 10 / 3, reviewCount: 3 });
  });
  it('subtracts rejected/deleted approved reviews and resets the final review', () => {
    assert.deepEqual(aggregateAfterTransition(4, 3, 2, 'approved', 'rejected'), { rating: 5, reviewCount: 2 });
    assert.deepEqual(aggregateAfterTransition(5, 1, 5, 'approved', null), { rating: 0, reviewCount: 0 });
  });
  it('does not change aggregates when an unapproved review is rejected or deleted', () => {
    assert.deepEqual(aggregateAfterTransition(4, 2, 1, 'pending', 'rejected'), { rating: 4, reviewCount: 2 });
    assert.deepEqual(aggregateAfterTransition(4, 2, 1, 'rejected', null), { rating: 4, reviewCount: 2 });
  });
});
