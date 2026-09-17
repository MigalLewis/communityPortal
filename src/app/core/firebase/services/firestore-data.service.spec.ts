import { firebaseClient } from '../firebase.client';
import { CollectionName, CollectionModelMap } from '../models/firestore-data.models';
import { FirestoreDataService } from './firestore-data.service';

describe('FirestoreDataService collection access', () => {
  const collections: CollectionName[] = [
    'events',
    'communityProjects',
    'resources',
    'resourceCategories',
    'committeeMembers',
    'communityPortfolios'
  ];
  const originalMockMode = firebaseClient.useMockFirestore;

  afterEach(() => {
    firebaseClient.useMockFirestore = originalMockMode;
  });

  it('addresses content collections in mock mode', async () => {
    firebaseClient.useMockFirestore = true;
    const service = new FirestoreDataService();

    for (const collection of collections) {
      expect(service[collection]).toBeDefined();
      expect(await service.list(collection)).toEqual([] as CollectionModelMap[typeof collection][]);
    }
  });

  it('addresses content collections through their real Firestore URLs', async () => {
    firebaseClient.useMockFirestore = false;
    const fetchSpy = spyOn(globalThis, 'fetch').and.resolveTo(new Response(JSON.stringify({ documents: [] }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }));
    const service = new FirestoreDataService();

    for (const collection of collections) {
      expect(service[collection]).toBeDefined();
      expect(await service.list(collection)).toEqual([] as CollectionModelMap[typeof collection][]);
      expect(fetchSpy.calls.mostRecent().args[0]).toContain(`/documents/${collection}?`);
    }
  });
});
