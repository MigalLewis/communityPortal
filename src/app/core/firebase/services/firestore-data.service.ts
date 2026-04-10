import { Injectable } from '@angular/core';
import { firebaseClient } from '../firebase.client';
import { CollectionModelMap, CollectionName, FirestoreEntity } from '../models/firestore-data.models';
import { FIRESTORE_COLLECTIONS } from './firestore-collection-names';
import { FirestoreDocumentResponse, fromFirestoreDocument, toFirestoreFields } from './firestore-serializer';

interface FirestoreListResponse {
  documents?: FirestoreDocumentResponse[];
}

class FirestoreEntityService<T extends FirestoreEntity> {
  constructor(
    private readonly collection: CollectionName,
    private readonly parent: FirestoreDataService
  ) {}

  list(idToken?: string): Promise<T[]> {
    return this.parent.list(this.collection, idToken);
  }

  getById(id: string, idToken?: string): Promise<T | null> {
    return this.parent.getById(this.collection, id, idToken);
  }

  upsert(document: T, idToken?: string): Promise<T> {
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
    categories: new Map(),
    reviews: new Map(),
    jobs: new Map(),
    messageThreads: new Map(),
    verifications: new Map()
  };

  readonly users = new FirestoreEntityService<CollectionModelMap['users']>('users', this);
  readonly contractors = new FirestoreEntityService<CollectionModelMap['contractors']>('contractors', this);
  readonly categories = new FirestoreEntityService<CollectionModelMap['categories']>('categories', this);
  readonly reviews = new FirestoreEntityService<CollectionModelMap['reviews']>('reviews', this);
  readonly jobs = new FirestoreEntityService<CollectionModelMap['jobs']>('jobs', this);
  readonly messageThreads = new FirestoreEntityService<CollectionModelMap['messageThreads']>('messageThreads', this);
  readonly verifications = new FirestoreEntityService<CollectionModelMap['verifications']>('verifications', this);

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
