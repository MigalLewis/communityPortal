import { Injectable } from '@angular/core';
import { ResourceCategoryDocument, ResourceDocument, ResourcePublicationState } from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';
import { ResourceFileService } from './resource-file.service';

export type ResourceInput = Omit<ResourceDocument, 'id' | 'createdAt' | 'updatedAt' | 'file' | 'archivedAt'>;

@Injectable({ providedIn: 'root' })
export class ResourceAdminService {
  constructor(private readonly data: FirestoreDataService, private readonly auth: AuthService,
    private readonly profiles: UserProfileService, private readonly files: ResourceFileService) {}
  async list(): Promise<ResourceDocument[]> { return this.data.resources.list(this.token()); }
  async categories(): Promise<ResourceCategoryDocument[]> { return this.data.resourceCategories.list(this.token()); }
  async save(input: ResourceInput, existing?: ResourceDocument, replacement?: File): Promise<ResourceDocument> {
    if (!input.title.trim() || !input.slug.trim() || !input.categoryId) throw new Error('Title, slug, and category are required.');
    if (input.accessMode === 'request' && !input.requestReason?.trim()) throw new Error('Request-only resources require a reason.');
    const duplicate = (await this.list()).find(item => item.slug === input.slug && item.id !== existing?.id);
    if (duplicate) throw new Error('Slug is already in use.');
    let uploaded = existing?.file;
    if (replacement) uploaded = await this.files.upload(replacement, this.token());
    if (input.accessMode === 'download' && !uploaded) throw new Error('Downloadable resources require a file.');
    const now = new Date().toISOString();
    const resource: ResourceDocument = { ...input, id: existing?.id ?? crypto.randomUUID(), createdAt: existing?.createdAt ?? now, updatedAt: now,
      ...(input.accessMode === 'download' && uploaded ? { file: uploaded } : {}) };
    try { await this.data.resources.upsert(resource, this.token()); }
    catch (error) { if (replacement && uploaded) await this.files.remove(uploaded.storagePath, this.token()); throw error; }
    if (existing?.file && existing.file.storagePath !== resource.file?.storagePath) await this.removeIfUnreferenced(existing.file.storagePath, resource.id);
    return resource;
  }
  async setState(resource: ResourceDocument, publicationState: ResourcePublicationState): Promise<void> {
    await this.data.resources.upsert({ ...resource, publicationState,
      ...(publicationState === 'archived' ? { archivedAt: new Date().toISOString(), quickLink: false } : {}) }, this.token());
  }
  async toggleQuickLink(resource: ResourceDocument): Promise<void> { await this.data.resources.upsert({ ...resource, quickLink: !resource.quickLink }, this.token()); }
  async delete(resource: ResourceDocument): Promise<void> {
    if (resource.publicationState === 'published') throw new Error('Archive a published resource before deleting it.');
    await this.data.resources.remove(resource.id, this.token());
    if (resource.file) await this.removeIfUnreferenced(resource.file.storagePath, resource.id);
  }
  private async removeIfUnreferenced(path: string, excludedId: string): Promise<void> {
    const referenced = (await this.list()).some(item => item.id !== excludedId && item.publicationState === 'published' && item.file?.storagePath === path);
    if (referenced) return;
    await this.files.remove(path, this.token());
  }
  private token(): string { const user = this.auth.authUser(); if (!user || !this.auth.isAuthenticated() || !this.profiles.isAdmin()) throw new Error('Administrator access is required.'); return user.idToken; }
}
