import { filterReviewRows, ReviewDisplayRow } from './admin-review.filters';

const row = (overrides: Partial<ReviewDisplayRow> = {}): ReviewDisplayRow => ({
  id: 'review', jobId: 'job', contractorId: 'contractor', residentId: 'resident', rating: 5,
  title: 'Great work', comment: 'Fast and tidy', moderationStatus: 'pending', residentName: 'Rene Resident',
  contractorName: 'Careful Construction', createdAt: '2026-01-01', updatedAt: '2026-01-01', ...overrides
});

describe('filterReviewRows', () => {
  const rows = [row(), row({ id: 'approved', moderationStatus: 'approved', comment: 'Excellent plumbing' })];
  it('filters by moderation state', () => expect(filterReviewRows(rows, '', 'approved').map((item) => item.id)).toEqual(['approved']));
  it('searches review text and party names case-insensitively', () => {
    expect(filterReviewRows(rows, 'RENE', 'all').length).toBe(2);
    expect(filterReviewRows(rows, 'plumbing', 'all').map((item) => item.id)).toEqual(['approved']);
    expect(filterReviewRows(rows, 'careful', 'pending').map((item) => item.id)).toEqual(['review']);
  });
});
