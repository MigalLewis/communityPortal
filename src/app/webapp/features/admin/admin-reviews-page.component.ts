import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReviewDocument, ReviewModerationStatus } from '../../../core/firebase/models/firestore-data.models';
import { filterReviewRows, ReviewDisplayRow } from './admin-review.filters';
import { AdminReviewService, ReviewModerationAction } from './admin-review.service';

@Component({
  selector: 'app-admin-reviews-page', standalone: true, imports: [CommonModule, FormsModule],
  templateUrl: './admin-reviews-page.component.html', styleUrl: './admin-reviews-page.component.scss'
})
export class AdminReviewsPageComponent {
  protected readonly rows = signal<ReviewDisplayRow[]>([]);
  protected readonly search = signal('');
  protected readonly status = signal<ReviewModerationStatus | 'all'>('all');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  protected readonly filtered = computed(() => filterReviewRows(this.rows(), this.search(), this.status()));

  constructor(private readonly reviews: AdminReviewService) { void this.load(); }

  protected async moderate(review: ReviewDocument, action: ReviewModerationAction): Promise<void> {
    const destructive = action === 'reject' || action === 'remove';
    const label = action === 'restore' ? 'restore and approve' : action;
    if (destructive && !confirm(`Are you sure you want to ${label} this review?`)) return;
    let reason: string | undefined;
    if (destructive) {
      reason = prompt(`Reason for ${label} (required):`)?.trim();
      if (!reason) { this.error.set('A reason is required to reject or remove a review.'); return; }
    }
    this.busy.set(true); this.error.set('');
    try { await this.reviews.moderate(review.id, action, reason); await this.load(false); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'The review could not be moderated.'); }
    finally { this.busy.set(false); }
  }

  private async load(showBusy = true): Promise<void> {
    if (showBusy) this.busy.set(true);
    this.error.set('');
    try {
      const result = await this.reviews.list();
      const users = new Map(result.users.map((user) => [user.id, user.fullName]));
      const contractors = new Map(result.contractors.map((contractor) => [contractor.id, contractor.businessName || contractor.fullName]));
      this.rows.set(result.reviews.map((review) => ({ ...review,
        moderationStatus: review.moderationStatus || 'pending',
        residentName: users.get(review.residentId) || review.residentId,
        contractorName: contractors.get(review.contractorId) || review.contractorId
      })).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Unable to load reviews.'); }
    finally { if (showBusy) this.busy.set(false); }
  }
}
