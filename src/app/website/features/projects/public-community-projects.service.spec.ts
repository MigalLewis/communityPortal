import { TestBed } from '@angular/core/testing';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { PublicCommunityProjectsService } from './public-community-projects.service';

describe('PublicCommunityProjectsService', () => {
  const published: any = { id: 'published', slug: 'public-project', publicationState: 'published', featured: false, startDate: '2026-01-01' };
  const data = { listPublishedCommunityProjects: jasmine.createSpy().and.resolveTo([published]) };
  beforeEach(() => TestBed.configureTestingModule({ providers: [PublicCommunityProjectsService, { provide: FirestoreDataService, useValue: data }] }));
  it('loads only through the published-project query and resolves public slugs', async () => {
    const service = TestBed.inject(PublicCommunityProjectsService);
    expect(await service.bySlug('public-project')).toBe(published);
    expect(await service.bySlug('unpublished-project')).toBeNull();
    expect(data.listPublishedCommunityProjects).toHaveBeenCalled();
  });
  it('chooses a featured record deterministically', () => {
    const service = TestBed.inject(PublicCommunityProjectsService);
    expect(service.featured([{ ...published, id: 'b', featured: true }, { ...published, id: 'a', featured: true }])?.id).toBe('a');
  });
});
