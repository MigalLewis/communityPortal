import { Injectable } from '@angular/core';
import { AdvertDocument, AdvertStatus } from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';
import { AdvertInput, validateAdvert } from './advert-validation';

@Injectable({ providedIn: 'root' })
export class AdvertAdminService {
  constructor(
    private readonly data: FirestoreDataService,
    private readonly auth: AuthService,
    private readonly profiles: UserProfileService
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
    if (status !== 'inactive' && Date.parse(advert.startAt) >= Date.parse(advert.endAt)) {
      throw new Error('End date must be after start date.');
    }
    return this.data.adverts.upsert({
      ...advert,
      status,
      updatedByAdminId: admin.id,
      ...(status === 'active' ? { activatedAt: now, activatedByAdminId: admin.id } : {}),
      ...(status === 'inactive' ? { deactivatedAt: now, deactivatedByAdminId: admin.id } : {})
    }, admin.idToken);
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
