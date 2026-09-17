import { Injectable } from '@angular/core';
import { CommitteeMemberDocument } from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';

export type CommitteeMemberInput = Omit<CommitteeMemberDocument, 'id' | 'createdAt' | 'updatedAt' | 'publishedAt'>;

@Injectable({ providedIn: 'root' })
export class CommitteeAdminService {
  constructor(private readonly data: FirestoreDataService, private readonly auth: AuthService, private readonly profiles: UserProfileService) {}
  list(): Promise<CommitteeMemberDocument[]> { return this.data.committeeMembers.list(this.token()); }
  get(id: string): Promise<CommitteeMemberDocument | null> { return this.data.committeeMembers.getById(id, this.token()); }
  async save(input: CommitteeMemberInput, existing?: CommitteeMemberDocument): Promise<CommitteeMemberDocument> {
    const duplicate = (await this.list()).some(item => item.slug === input.slug && item.id !== existing?.id);
    if (duplicate) throw new Error('Slug is already in use.');
    const now = new Date().toISOString();
    return this.data.committeeMembers.upsert({ ...input, id: existing?.id ?? crypto.randomUUID(), createdAt: existing?.createdAt ?? now, updatedAt: now,
      ...(input.publicationState === 'published' ? { publishedAt: existing?.publishedAt ?? now } : {}) }, this.token());
  }
  remove(id: string): Promise<void> { return this.data.committeeMembers.remove(id, this.token()); }
  private token(): string { const user = this.auth.authUser(); if (!user || !this.profiles.isAdmin()) throw new Error('Administrator access is required.'); return user.idToken; }
}
