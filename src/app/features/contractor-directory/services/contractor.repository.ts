import { Injectable } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';
import { ContractorDocument } from '../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { FirestoreDocumentResponse, fromFirestoreDocument } from '../../../core/firebase/services/firestore-serializer';
import { AuthService } from '../../auth/services/auth.service';

export type EditableContractorProfile = Pick<ContractorDocument,
  'businessName' | 'bio' | 'categoryIds' | 'services' | 'serviceAreas' | 'profileVisibility' |
  'jobAvailability' | 'contactPreferences' | 'portfolioMedia'>;

export const isDirectoryContractor = (contractor: ContractorDocument): boolean =>
  contractor.status === 'active' && contractor.approvalStatus === 'approved' &&
  contractor.profileVisibility === 'public';

@Injectable({ providedIn: 'root' })
export class ContractorRepository {
  constructor(private readonly data: FirestoreDataService, private readonly auth: AuthService) {}

  async listPublic(): Promise<ContractorDocument[]> {
    if (firebaseClient.useMockFirestore) return (await this.data.contractors.list()).filter(isDirectoryContractor);
    const filters = [
      ['status', 'active'], ['approvalStatus', 'approved'], ['profileVisibility', 'public']
    ].map(([field, value]) => ({ fieldFilter: { field: { fieldPath: field }, op: 'EQUAL', value: { stringValue: value } } }));
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'contractors' }], where: { compositeFilter: { op: 'AND', filters } } } })
    });
    if (!response.ok) throw new Error('Unable to load the contractor directory.');
    const rows = await response.json() as Array<{ document?: FirestoreDocumentResponse }>;
    return rows.map((row) => row.document && fromFirestoreDocument<ContractorDocument>(row.document))
      .filter((item): item is ContractorDocument => !!item && isDirectoryContractor(item));
  }

  async getPublicById(id: string): Promise<ContractorDocument | null> {
    const contractor = await this.data.contractors.getById(id);
    return contractor && isDirectoryContractor(contractor) ? contractor : null;
  }

  async getOwned(): Promise<ContractorDocument | null> {
    const user = this.auth.authUser();
    if (!user) return null;
    const contractor = await this.data.contractors.getById(user.id, user.idToken);
    return contractor?.userId === user.id ? contractor : null;
  }

  async updateOwnedProfile(changes: EditableContractorProfile): Promise<ContractorDocument> {
    const user = this.auth.authUser();
    const existing = await this.getOwned();
    if (!user || !existing || existing.status !== 'active' || existing.approvalStatus !== 'approved') {
      throw new Error('Only active, approved contractors can edit a profile.');
    }
    return this.data.contractors.upsert({ ...existing, ...changes, id: existing.id, userId: existing.userId,
      rating: existing.rating, reviewCount: existing.reviewCount, verified: existing.verified,
      approvalStatus: existing.approvalStatus, status: existing.status, createdAt: existing.createdAt,
      updatedAt: new Date().toISOString() }, user.idToken);
  }
}
