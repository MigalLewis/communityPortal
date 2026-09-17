import { validateCommunityProject } from './community-project-validation';

describe('validateCommunityProject', () => {
  const valid: any = { slug: 'pocket-park', title: 'Pocket Park', summary: 'Summary', content: 'Full content', category: 'Environment', status: 'active', image: { url: 'park.jpg', altText: 'A park' }, progress: 65, featured: true, startDate: '2026-01-01', completionDate: '2026-06-01', publicationMode: 'manual' };
  it('accepts complete project content', () => expect(validateCommunityProject(valid)).toEqual([]));
  it('validates content, progress, image metadata, slug, and chronological dates', () => expect(validateCommunityProject({ ...valid, slug: 'Bad Slug', content: '', progress: 101, image: { url: '', altText: '' }, completionDate: '2025-01-01' }).length).toBe(6));
  it('requires valid ordered visibility instants only when scheduled', () => expect(validateCommunityProject({ ...valid, publicationMode: 'scheduled', visibleFrom: 'bad', visibleUntil: '' })).toContain('Valid visibility start and end times are required for time based publication.'));
});
