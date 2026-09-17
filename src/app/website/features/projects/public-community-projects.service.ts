import { Injectable } from '@angular/core';
import { CommunityProjectDocument } from '../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';

@Injectable({ providedIn: 'root' })
export class PublicCommunityProjectsService {
  constructor(private readonly data: FirestoreDataService) {}
  list(): Promise<CommunityProjectDocument[]> { return this.data.listPublishedCommunityProjects(); }
  async bySlug(slug: string): Promise<CommunityProjectDocument | null> {
    return (await this.list()).find(project => project.slug === slug) ?? null;
  }
  featured(projects: CommunityProjectDocument[]): CommunityProjectDocument | null {
    const ordered = [...projects].sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? '') || a.id.localeCompare(b.id));
    return ordered.find(project => project.featured) ?? ordered[0] ?? null;
  }
}
