import { Injectable } from '@angular/core';
import { EventDocument } from '../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';

@Injectable({ providedIn: 'root' })
export class PublicEventsService {
  constructor(private readonly data: FirestoreDataService) {}
  list(): Promise<EventDocument[]> { return this.data.listPublishedEvents(); }
  async bySlug(slug: string): Promise<EventDocument | null> { return (await this.list()).find(event => event.slug === slug) ?? null; }
  /** Featured ties are intentionally resolved by date, then stable id. */
  featured(events: EventDocument[]): EventDocument | null {
    const ordered = [...events].sort((a, b) => a.startAt.localeCompare(b.startAt) || a.id.localeCompare(b.id));
    return ordered.find(event => event.featured) ?? ordered[0] ?? null;
  }
}
