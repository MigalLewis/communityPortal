import { filterResources } from './public-resource.repository';
describe('resource search', () => {
  const item = (id: string, title: string, categoryId: string, date: string) => ({ id, title, categoryId, publicationDate: date, description: '', slug: id, publicationState: 'published', accessMode: 'request', featured: false, quickLink: false, createdAt: '', updatedAt: '' } as const);
  it('combines text/category filtering and deterministic sorting', () => { const values = [item('b', 'Zulu Form', 'forms', '2025-01-01'), item('a', 'Alpha Guide', 'guides', '2026-01-01')]; expect(filterResources(values, 'alpha', '', 'newest')[0].id).toBe('a'); expect(filterResources(values, '', 'forms', 'title')[0].id).toBe('b'); });
});
