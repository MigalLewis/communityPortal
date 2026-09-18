import { CommunityProjectDocument, JobDocument } from './firestore-data.models';
import { FIRESTORE_COLLECTIONS } from '../services/firestore-collection-names';

describe('CommunityProjectDocument', () => {
  it('uses a dedicated collection and content shape rather than resident job requests', () => {
    const project: CommunityProjectDocument = { id: 'park', slug: 'pocket-park', title: 'Pocket Park', summary: 'A greener corner', content: 'Full public story', category: 'Environment', status: 'active', image: { url: 'park.jpg', altText: 'Pocket park' }, progress: 65, featured: true, publicationState: 'published', publicationMode: 'manual', schedulingState: 'manual', isPublic: true, startDate: '2026-01-01', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    const job: JobDocument = { id: 'repair', residentId: 'resident', categoryId: 'repairs', title: 'Fix gate', description: 'Resident request', status: 'open', createdAt: '2026-01-01', updatedAt: '2026-01-01' };
    expect(FIRESTORE_COLLECTIONS.communityProjects).toBe('communityProjects');
    expect(FIRESTORE_COLLECTIONS.jobs).toBe('jobs');
    expect(project.slug).toBe('pocket-park');
    expect('residentId' in project).toBeFalse();
    expect('publicationState' in job).toBeFalse();
  });
});
