import { TestBed } from '@angular/core/testing';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';
import { AuthService } from '../../auth/services/auth.service';
import { UserProfileService } from '../../auth/services/user-profile.service';
import { CommunityProjectAdminService } from './community-project-admin.service';

describe('CommunityProjectAdminService', () => {
  const project: any = { id: 'project', slug: 'pocket-park', title: 'Pocket Park', summary: 'Summary', content: 'Content', category: 'Environment', status: 'active', image: { url: 'park.jpg', altText: 'Park' }, progress: 50, featured: false, publicationState: 'draft', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
  let collection: any; let service: CommunityProjectAdminService;
  beforeEach(() => {
    collection = { list: jasmine.createSpy().and.resolveTo([]), getById: jasmine.createSpy().and.resolveTo(project), upsert: jasmine.createSpy().and.callFake((value: any) => Promise.resolve(value)), remove: jasmine.createSpy().and.resolveTo() };
    TestBed.configureTestingModule({ providers: [CommunityProjectAdminService, { provide: FirestoreDataService, useValue: { communityProjects: collection } }, { provide: AuthService, useValue: { authUser: () => ({ idToken: 'admin-token' }), isAuthenticated: () => true } }, { provide: UserProfileService, useValue: { isAdmin: () => true } }] });
    service = TestBed.inject(CommunityProjectAdminService);
  });
  it('creates and reads records in the dedicated project collection', async () => {
    expect(await service.get('project')).toBe(project);
    const created = await service.save(project);
    expect(created.publicationState).toBe('draft');
    expect(collection.upsert).toHaveBeenCalledWith(jasmine.objectContaining({ slug: 'pocket-park' }), 'admin-token');
  });
  it('publishes, archives, features, and deletes projects', async () => {
    expect((await service.setPublication(project, 'published')).publicationState).toBe('published');
    expect((await service.setStatus(project, 'archived')).publicationState).toBe('draft');
    expect((await service.setFeatured(project, true)).featured).toBeTrue();
    await service.delete(project);
    expect(collection.remove).toHaveBeenCalledWith('project', 'admin-token');
  });
});
