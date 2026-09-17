import { Injectable } from '@angular/core';
import { EventDocument, EventPublicationStatus } from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';
import { EventInput, validateEvent } from './event-validation';

@Injectable({ providedIn: 'root' })
export class EventAdminService {
  constructor(private readonly data: FirestoreDataService, private readonly auth: AuthService, private readonly profiles: UserProfileService) {}

  async list(): Promise<EventDocument[]> { return (await this.data.events.list(this.adminToken())).sort((a, b) => a.startAt.localeCompare(b.startAt)); }
  async get(id: string): Promise<EventDocument | null> { return this.data.events.getById(id, this.adminToken()); }

  async save(input: EventInput, existing?: EventDocument): Promise<EventDocument> {
    const errors = validateEvent(input);
    const duplicate = (await this.list()).find(event => event.slug === input.slug && event.id !== existing?.id);
    if (duplicate) errors.push('Slug is already in use.');
    if (errors.length) throw new Error(errors.join(' '));
    const now = new Date().toISOString();
    return this.data.events.upsert({ ...input, id: existing?.id ?? crypto.randomUUID(), status: existing?.status ?? 'draft',
      createdAt: existing?.createdAt ?? now, updatedAt: now, publishedAt: existing?.publishedAt, archivedAt: existing?.archivedAt }, this.adminToken());
  }

  async setStatus(event: EventDocument, status: EventPublicationStatus): Promise<EventDocument> {
    const now = new Date().toISOString();
    return this.data.events.upsert({ ...event, status, updatedAt: now,
      ...(status === 'published' && !event.publishedAt ? { publishedAt: now } : {}),
      ...(status === 'archived' ? { archivedAt: now } : {}) }, this.adminToken());
  }

  async setFeatured(event: EventDocument, featured: boolean): Promise<EventDocument> {
    return this.data.events.upsert({ ...event, featured }, this.adminToken());
  }
  async delete(event: EventDocument): Promise<void> { return this.data.events.remove(event.id, this.adminToken()); }

  private adminToken(): string {
    const user = this.auth.authUser();
    if (!user || !this.auth.isAuthenticated() || !this.profiles.isAdmin()) throw new Error('Administrator access is required.');
    return user.idToken;
  }
}
