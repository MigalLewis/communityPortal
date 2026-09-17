import { ReviewDocument, ReviewModerationStatus } from '../../../core/firebase/models/firestore-data.models';

export interface ReviewDisplayRow extends ReviewDocument { residentName: string; contractorName: string; }

export function filterReviewRows(rows: ReviewDisplayRow[], search: string, status: ReviewModerationStatus | 'all'): ReviewDisplayRow[] {
  const query = search.trim().toLocaleLowerCase();
  return rows.filter((row) => (status === 'all' || row.moderationStatus === status)
    && (!query || `${row.comment} ${row.title ?? ''} ${row.residentName} ${row.contractorName}`.toLocaleLowerCase().includes(query)));
}
