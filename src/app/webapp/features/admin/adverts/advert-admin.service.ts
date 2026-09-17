import { Injectable } from '@angular/core';
import { AdvertDocument, AdvertStatus } from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';
import { AdvertInput, validateAdvert } from './advert-validation';
import { AdvertMediaService } from './advert-media.service';

@Injectable({ providedIn: 'root' })
export class AdvertAdminService {
  constructor(
    private readonly data: FirestoreDataService,
    private readonly auth: AuthService,
    private readonly profiles: UserProfileService,
    private readonly media: AdvertMediaService
  ) {}

  async list(): Promise<AdvertDocument[]> {
    return (await this.data.adverts.list(this.admin().idToken))
      .sort((a, b) => b.sortPriority - a.sortPriority || a.startAt.localeCompare(b.startAt));
  }

  async get(id: string): Promise<AdvertDocument | null> {
    return this.data.adverts.getById(id, this.admin().idToken);
  }

  async create(input: AdvertInput): Promise<AdvertDocument> {
    const admin = this.admin();
    this.assertValid(input);
    const now = new Date().toISOString();
    return this.data.adverts.upsert({
      ...input,
      isPublic: input.status === 'active',
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      ownerAdminId: admin.id,
      createdByAdminId: admin.id,
      updatedByAdminId: admin.id
    }, admin.idToken);
  }

  async update(existing: AdvertDocument, input: AdvertInput): Promise<AdvertDocument> {
    const admin = this.admin();
    this.assertValid(input);
    return this.data.adverts.upsert({
      ...existing,
      ...input,
      // Status changes are centralized below so audit fields cannot be bypassed.
      status: existing.status,
      isPublic: existing.status === 'active',
      id: existing.id,
      createdAt: existing.createdAt,
      ownerAdminId: existing.ownerAdminId,
      createdByAdminId: existing.createdByAdminId,
      updatedByAdminId: admin.id
    }, admin.idToken);
  }

  async setStatus(advert: AdvertDocument, status: Extract<AdvertStatus, 'scheduled' | 'active' | 'inactive'>): Promise<AdvertDocument> {
    const admin = this.admin();
    const now = new Date().toISOString();
    this.assertValid({ ...advert, status });
    const activating = status === 'active' && advert.status !== 'active';
    const deactivating = advert.status === 'active' && status !== 'active';
    return this.data.adverts.upsert({
      ...advert,
      status,
      isPublic: status === 'active',
      updatedAt: now,
      updatedByAdminId: admin.id,
      ...(activating ? { activatedAt: now, activatedByAdminId: admin.id } : {}),
      ...(deactivating ? { deactivatedAt: now, deactivatedByAdminId: admin.id } : {})
    }, admin.idToken);
  }

  async delete(advert: AdvertDocument): Promise<void> {
    const admin = this.admin();
    await this.data.adverts.remove(advert.id, admin.idToken);
  }

  async uploadMedia(file: File): Promise<string> {
    return this.media.upload(file, this.admin().idToken);
  }

  private admin() {
    const user = this.auth.authUser();
    if (!this.auth.isAuthenticated() || !this.profiles.isAdmin() || !user) {
      throw new Error('Administrator access is required.');
    }
    return user;
  }

  private assertValid(input: AdvertInput): void {
    const errors = validateAdvert(input);
    if (errors.length) throw new Error(errors.join(' '));
  }
}
