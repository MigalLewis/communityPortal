import { Injectable } from '@angular/core';
import {
  CommunityProjectDocument,
  CommunityProjectPublicationState,
  CommunityProjectStatus
} from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';
import { CommunityProjectInput, validateCommunityProject } from './community-project-validation';

@Injectable({ providedIn: 'root' })
export class CommunityProjectAdminService {
  constructor(private readonly data: FirestoreDataService, private readonly auth: AuthService, private readonly profiles: UserProfileService) {}

  async list(): Promise<CommunityProjectDocument[]> {
    return (await this.data.communityProjects.list(this.adminToken()))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }
  get(id: string): Promise<CommunityProjectDocument | null> { return this.data.communityProjects.getById(id, this.adminToken()); }

  async save(input: CommunityProjectInput, existing?: CommunityProjectDocument): Promise<CommunityProjectDocument> {
    const errors = validateCommunityProject(input);
    if ((await this.list()).some(project => project.slug === input.slug && project.id !== existing?.id)) errors.push('Slug is already in use.');
    if (errors.length) throw new Error(errors.join(' '));
    const now = new Date().toISOString();
    const scheduled = input.publicationMode === 'scheduled';
    return this.data.communityProjects.upsert({
      ...input, id: existing?.id ?? crypto.randomUUID(), publicationState: scheduled ? 'draft' : (existing?.publicationState ?? 'draft'),
      schedulingState: scheduled ? 'pending' : 'manual', isPublic: scheduled ? false : existing?.publicationState === 'published',
      createdAt: existing?.createdAt ?? now, updatedAt: now, publishedAt: existing?.publishedAt,
      archivedAt: existing?.archivedAt, scheduleStateChangedAt: now,
      scheduleStateChangeReason: scheduled ? 'schedule_configured' : 'manual_publication_selected'
    }, this.adminToken());
  }

  setPublication(project: CommunityProjectDocument, publicationState: CommunityProjectPublicationState): Promise<CommunityProjectDocument> {
    const now = new Date().toISOString();
    return this.data.communityProjects.upsert({ ...project, publicationState, publicationMode: 'manual', schedulingState: 'manual',
      isPublic: publicationState === 'published', visibleFrom: undefined, visibleUntil: undefined, updatedAt: now,
      scheduleStateChangedAt: now, scheduleStateChangeReason: `manual_${publicationState}`,
      ...(publicationState === 'published' && !project.publishedAt ? { publishedAt: now } : {}) }, this.adminToken());
  }

  setStatus(project: CommunityProjectDocument, status: CommunityProjectStatus): Promise<CommunityProjectDocument> {
    const now = new Date().toISOString();
    return this.data.communityProjects.upsert({ ...project, status, updatedAt: now,
      ...(status === 'archived' ? { archivedAt: now, publicationState: 'draft' as const, isPublic: false } : {}) }, this.adminToken());
  }

  setFeatured(project: CommunityProjectDocument, featured: boolean): Promise<CommunityProjectDocument> {
    return this.data.communityProjects.upsert({ ...project, featured }, this.adminToken());
  }
  delete(project: CommunityProjectDocument): Promise<void> { return this.data.communityProjects.remove(project.id, this.adminToken()); }

  private adminToken(): string {
    const user = this.auth.authUser();
    if (!user || !this.auth.isAuthenticated() || !this.profiles.isAdmin()) throw new Error('Administrator access is required.');
    return user.idToken;
  }
}
