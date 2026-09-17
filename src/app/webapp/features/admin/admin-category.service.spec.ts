import { CategoryDocument } from '../../../core/firebase/models/firestore-data.models';
import { AdminCategoryService, normalizeCategorySlug } from './admin-category.service';

describe('AdminCategoryService', () => {
  const category = (overrides: Partial<CategoryDocument> = {}): CategoryDocument => ({
    id: 'cat-1', name: 'Home Repair', slug: 'home-repair', description: '', icon: '', isActive: true,
    createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z', ...overrides
  });

  function setup(existing: CategoryDocument[] = []) {
    const categories = {
      list: jasmine.createSpy().and.resolveTo(existing),
      upsert: jasmine.createSpy().and.callFake(async (value: CategoryDocument) => value),
      remove: jasmine.createSpy().and.resolveTo()
    };
    const contractors = { list: jasmine.createSpy().and.resolveTo([]) };
    const serviceProviders = { list: jasmine.createSpy().and.resolveTo([]) };
    const service = new AdminCategoryService(
      { categories, contractors, serviceProviders } as any,
      { isAuthenticated: () => true, authUser: () => ({ id: 'admin', idToken: 'admin-token' }) } as any,
      { isAdmin: () => true } as any
    );
    return { service, categories, contractors, serviceProviders };
  }

  it('normalizes slugs consistently', () => {
    expect(normalizeCategorySlug('  Café & Home Repairs! ')).toBe('cafe-home-repairs');
  });

  it('loads sorted categories with the administrator token', async () => {
    const { service, categories } = setup([category({ name: 'Zebra' }), category({ id: '2', name: 'Appliance' })]);
    expect((await service.list()).map((item) => item.name)).toEqual(['Appliance', 'Zebra']);
    expect(categories.list).toHaveBeenCalledWith('admin-token');
  });

  it('creates a category with a generated normalized slug and token', async () => {
    const { service, categories } = setup();
    const saved = await service.create({ name: '  Garden & Trees ', isActive: true });
    expect(saved.slug).toBe('garden-trees');
    expect(saved.name).toBe('Garden & Trees');
    expect(categories.upsert.calls.mostRecent().args[1]).toBe('admin-token');
  });

  it('rejects missing names and duplicate normalized slugs', async () => {
    const { service } = setup([category()]);
    await expectAsync(service.create({ name: ' ', isActive: true })).toBeRejectedWithError('Name is required.');
    await expectAsync(service.create({ name: 'Other', slug: ' HOME repair ', isActive: true })).toBeRejectedWithError('Slug is already in use. Choose a unique slug.');
  });

  it('updates while preserving identity and creation time', async () => {
    const existing = category(); const { service, categories } = setup([existing]);
    const saved = await service.update(existing, { name: 'Plumbing', slug: 'Plumbing!', isActive: false });
    expect(saved).toEqual(jasmine.objectContaining({ id: 'cat-1', createdAt: existing.createdAt, slug: 'plumbing', isActive: false }));
    expect(categories.upsert.calls.mostRecent().args[1]).toBe('admin-token');
  });

  it('checks both dependency collections and blocks deletion while in use', async () => {
    const { service, categories, contractors, serviceProviders } = setup();
    contractors.list.and.resolveTo([{ categoryIds: ['cat-1'] }]);
    serviceProviders.list.and.resolveTo([{ categoryIds: ['cat-1'] }, { categoryIds: ['other'] }]);
    await expectAsync(service.remove(category())).toBeRejectedWithError(/in use by 1 contractor\(s\).*1 service provider/);
    expect(categories.remove).not.toHaveBeenCalled();
    expect(contractors.list).toHaveBeenCalledWith('admin-token');
    expect(serviceProviders.list).toHaveBeenCalledWith('admin-token');
  });

  it('deletes an unused category and forwards failed requests', async () => {
    const { service, categories } = setup();
    await service.remove(category());
    expect(categories.remove).toHaveBeenCalledWith('cat-1', 'admin-token');
    categories.list.and.rejectWith(new Error('network unavailable'));
    await expectAsync(service.list()).toBeRejectedWithError('network unavailable');
  });
});
