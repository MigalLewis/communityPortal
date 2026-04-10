import { CollectionName } from '../models/firestore-data.models';

export const FIRESTORE_COLLECTIONS: Record<CollectionName, CollectionName> = {
  users: 'users',
  contractors: 'contractors',
  categories: 'categories',
  reviews: 'reviews',
  jobs: 'jobs',
  messageThreads: 'messageThreads',
  verifications: 'verifications'
};
