import { Injectable } from '@angular/core';
import { firebaseClient } from '../firebase.client';
import { CollectionModelMap, CollectionName, FirestoreEntity } from '../models/firestore-data.models';
import { FIRESTORE_COLLECTIONS } from './firestore-collection-names';
import { FirestoreDocumentResponse, fromFirestoreDocument, toFirestoreFields } from './firestore-serializer';

interface FirestoreListResponse {
  documents?: FirestoreDocumentResponse[];
}

interface FirestoreQueryResponse { document?: FirestoreDocumentResponse; }

class FirestoreEntityService<K extends CollectionName> {
  constructor(
    private readonly collection: K,
    private readonly parent: FirestoreDataService
  ) {}

  list(idToken?: string): Promise<CollectionModelMap[K][]> {
    return this.parent.list(this.collection, idToken);
  }

  getById(id: string, idToken?: string): Promise<CollectionModelMap[K] | null> {
    return this.parent.getById(this.collection, id, idToken);
  }

  upsert(document: CollectionModelMap[K], idToken?: string): Promise<CollectionModelMap[K]> {
    return this.parent.upsert(this.collection, document, idToken);
  }

  remove(id: string, idToken?: string): Promise<void> {
    return this.parent.remove(this.collection, id, idToken);
  }
}

@Injectable({ providedIn: 'root' })
export class FirestoreDataService {
  private readonly mockMode = firebaseClient.useMockFirestore;
  private readonly mockStore: { [K in CollectionName]: Map<string, CollectionModelMap[K]> } = {
    users: new Map(),
    contractors: new Map(),
    serviceProviders: new Map(),
    categories: new Map(),
    reviews: new Map(),
    jobs: new Map(),
    messageThreads: new Map(),
    verifications: new Map(),
    userTransitionAudits: new Map(),
    reviewModerationAudits: new Map(),
    adverts: new Map(),
    events: new Map(),
    resourceCategories: new Map(),
    resources: new Map(),
    communityProjects: new Map(),
    committeeMembers: new Map(),
    communityPortfolios: new Map()
  };

  readonly users = new FirestoreEntityService<'users'>('users', this);
  readonly contractors = new FirestoreEntityService<'contractors'>('contractors', this);
  readonly serviceProviders = new FirestoreEntityService<'serviceProviders'>('serviceProviders', this);
  readonly categories = new FirestoreEntityService<'categories'>('categories', this);
  readonly reviews = new FirestoreEntityService<'reviews'>('reviews', this);
  readonly jobs = new FirestoreEntityService<'jobs'>('jobs', this);
  readonly messageThreads = new FirestoreEntityService<'messageThreads'>('messageThreads', this);
  readonly verifications = new FirestoreEntityService<'verifications'>('verifications', this);
  readonly userTransitionAudits = new FirestoreEntityService<'userTransitionAudits'>('userTransitionAudits', this);
  readonly reviewModerationAudits = new FirestoreEntityService<'reviewModerationAudits'>('reviewModerationAudits', this);
  readonly adverts = new FirestoreEntityService<'adverts'>('adverts', this);
  readonly events = new FirestoreEntityService<'events'>('events', this);
  readonly resourceCategories = new FirestoreEntityService<'resourceCategories'>('resourceCategories', this);
  readonly resources = new FirestoreEntityService<'resources'>('resources', this);
  readonly communityProjects = new FirestoreEntityService<'communityProjects'>('communityProjects', this);
  readonly committeeMembers = new FirestoreEntityService<'committeeMembers'>('committeeMembers', this);
  readonly communityPortfolios = new FirestoreEntityService<'communityPortfolios'>('communityPortfolios', this);

  async listPublishedCommitteeMembers(): Promise<CollectionModelMap['committeeMembers'][]> {
    return (await this.listPublicByState('committeeMembers')).sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  }

  async listPublishedCommunityPortfolios(): Promise<CollectionModelMap['communityPortfolios'][]> {
    return (await this.listPublicByState('communityPortfolios')).sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name));
  }

  async listPublishedResources(): Promise<CollectionModelMap['resources'][]> {
    return this.listPublicByState('resources');
  }

  async listPublishedResourceCategories(): Promise<CollectionModelMap['resourceCategories'][]> {
    return this.listPublicByState('resourceCategories');
  }

  /** Lists public PNRA projects using the publication predicate required by Firestore rules. */
  async listPublishedCommunityProjects(): Promise<CollectionModelMap['communityProjects'][]> {
    if (this.mockMode) {
      return Array.from(this.mockStore.communityProjects.values())
        .filter(project => project.publicationState === 'published' && project.isPublic === true);
    }
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST', headers: this.buildHeaders(undefined, true), body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: FIRESTORE_COLLECTIONS.communityProjects }],
          where: { compositeFilter: { op: 'AND', filters: [
            { fieldFilter: { field: { fieldPath: 'publicationState' }, op: 'EQUAL', value: { stringValue: 'published' } } },
            { fieldFilter: { field: { fieldPath: 'isPublic' }, op: 'EQUAL', value: { booleanValue: true } } }
          ] } }
        }
      })
    });
    if (!response.ok) throw new Error('Failed to list published community projects.');
    const payload = await response.json() as FirestoreQueryResponse[];
    return payload.map(item => item.document && fromFirestoreDocument<CollectionModelMap['communityProjects']>(item.document))
      .filter((project): project is CollectionModelMap['communityProjects'] => !!project)
      .sort((a, b) => (b.startDate ?? '').localeCompare(a.startDate ?? '') || a.title.localeCompare(b.title));
  }

  /** Lists only records that Firestore rules permit an unauthenticated visitor to see. */
  async listPublishedEvents(): Promise<CollectionModelMap['events'][]> {
    if (this.mockMode) {
      return Array.from(this.mockStore.events.values()).filter(event => event.status === 'published' && event.isPublic === true);
    }
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST', headers: this.buildHeaders(undefined, true), body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: FIRESTORE_COLLECTIONS.events }],
          where: { compositeFilter: { op: 'AND', filters: [
            { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'published' } } },
            { fieldFilter: { field: { fieldPath: 'isPublic' }, op: 'EQUAL', value: { booleanValue: true } } }
          ] } }
        }
      })
    });
    if (!response.ok) throw new Error('Failed to list published events.');
    const payload = await response.json() as FirestoreQueryResponse[];
    return payload.map(item => item.document && fromFirestoreDocument<CollectionModelMap['events']>(item.document))
      .filter((event): event is CollectionModelMap['events'] => !!event)
      .sort((a, b) => a.startAt.localeCompare(b.startAt));
  }

  /** Uses predicates that Firestore rules can prove before applying schedule checks client-side. */
  async listPublicAdverts(): Promise<CollectionModelMap['adverts'][]> {
    if (this.mockMode) {
      return Array.from(this.mockStore.adverts.values()).filter(advert => advert.isPublic && advert.status === 'active');
    }
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST',
      headers: this.buildHeaders(undefined, true),
      body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: FIRESTORE_COLLECTIONS.adverts }],
        where: { compositeFilter: { op: 'AND', filters: [
          { fieldFilter: { field: { fieldPath: 'isPublic' }, op: 'EQUAL', value: { booleanValue: true } } },
          { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'active' } } }
        ] } }
      } })
    });
    if (!response.ok) throw new Error('Failed to list public adverts.');
    const payload = await response.json() as FirestoreQueryResponse[];
    return payload.map(item => item.document && fromFirestoreDocument<CollectionModelMap['adverts']>(item.document))
      .filter((advert): advert is CollectionModelMap['adverts'] => !!advert);
  }

  async list<K extends CollectionName>(collection: K, idToken?: string): Promise<CollectionModelMap[K][]> {
    if (this.mockMode) {
      return Array.from(this.mockStore[collection].values());
    }

    const response = await fetch(this.collectionUrl(collection), {
      headers: this.buildHeaders(idToken)
    });

    if (!response.ok) {
      throw new Error(`Failed to list ${collection}.`);
    }

    const payload = (await response.json()) as FirestoreListResponse;

    return (payload.documents ?? [])
      .map((doc) => fromFirestoreDocument<CollectionModelMap[K]>(doc))
      .filter((doc): doc is CollectionModelMap[K] => !!doc);
  }

  async getById<K extends CollectionName>(collection: K, id: string, idToken?: string): Promise<CollectionModelMap[K] | null> {
    if (this.mockMode) {
      return this.mockStore[collection].get(id) ?? null;
    }

    const response = await fetch(this.documentUrl(collection, id), {
      headers: this.buildHeaders(idToken)
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as FirestoreDocumentResponse;
    return fromFirestoreDocument<CollectionModelMap[K]>(payload);
  }

  async upsert<K extends CollectionName>(
    collection: K,
    document: CollectionModelMap[K],
    idToken?: string
  ): Promise<CollectionModelMap[K]> {
    const normalized = this.normalizeTimestamps(document);

    if (this.mockMode) {
      this.mockStore[collection].set(document.id, normalized);
      return normalized;
    }

    const response = await fetch(this.documentUrl(collection, document.id), {
      method: 'PATCH',
      headers: this.buildHeaders(idToken, true),
      body: JSON.stringify({
        fields: toFirestoreFields(normalized)
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to save ${collection}/${document.id}.`);
    }

    return normalized;
  }

  async remove<K extends CollectionName>(collection: K, id: string, idToken?: string): Promise<void> {
    if (this.mockMode) {
      this.mockStore[collection].delete(id);
      return;
    }

    const response = await fetch(this.documentUrl(collection, id), {
      method: 'DELETE',
      headers: this.buildHeaders(idToken)
    });

    if (!response.ok) {
      throw new Error(`Failed to delete ${collection}/${id}.`);
    }
  }

  private collectionUrl(collection: CollectionName): string {
    return `${firebaseClient.firestoreBaseUrl}/${FIRESTORE_COLLECTIONS[collection]}?key=${firebaseClient.apiKey}`;
  }

  private async listPublicByState<K extends 'resources' | 'resourceCategories' | 'committeeMembers' | 'communityPortfolios'>(collection: K): Promise<CollectionModelMap[K][]> {
    if (this.mockMode) return Array.from(this.mockStore[collection].values()).filter(item => item.publicationState === 'published');
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST', headers: this.buildHeaders(undefined, true), body: JSON.stringify({ structuredQuery: {
        from: [{ collectionId: FIRESTORE_COLLECTIONS[collection] }],
        where: { fieldFilter: { field: { fieldPath: 'publicationState' }, op: 'EQUAL', value: { stringValue: 'published' } } }
      } })
    });
    if (!response.ok) throw new Error(`Failed to list published ${collection}.`);
    const payload = await response.json() as FirestoreQueryResponse[];
    return payload.map(item => item.document && fromFirestoreDocument<CollectionModelMap[K]>(item.document))
      .filter((item): item is CollectionModelMap[K] => !!item);
  }

  private documentUrl(collection: CollectionName, id: string): string {
    return `${firebaseClient.firestoreBaseUrl}/${FIRESTORE_COLLECTIONS[collection]}/${id}?key=${firebaseClient.apiKey}`;
  }

  private buildHeaders(idToken?: string, json = false): HeadersInit {
    return {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
    };
  }

  private normalizeTimestamps<K extends CollectionName>(document: CollectionModelMap[K]): CollectionModelMap[K] {
    return {
      ...document,
      createdAt: document.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}
