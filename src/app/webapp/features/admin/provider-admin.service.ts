import { Injectable } from '@angular/core';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { ServiceProviderDocument } from '../../../core/firebase/models/firestore-data.models';

@Injectable({ providedIn: 'root' })
export class ProviderAdminService {
  constructor(private readonly firestoreDataService: FirestoreDataService) {}

  async createSingleProvider(document: ServiceProviderDocument, idToken?: string): Promise<ServiceProviderDocument> {
    return this.firestoreDataService.serviceProviders.upsert(document, idToken);
  }

  async importProviders(documents: ServiceProviderDocument[], idToken?: string): Promise<{ successCount: number; failed: Array<{ id: string; error: string }> }> {
    const failed: Array<{ id: string; error: string }> = [];

    for (const document of documents) {
      try {
        await this.firestoreDataService.serviceProviders.upsert(document, idToken);
      } catch (error: unknown) {
        failed.push({
          id: document.id,
          error: error instanceof Error ? error.message : 'Unknown save error'
        });
      }
    }

    return {
      successCount: documents.length - failed.length,
      failed
    };
  }

  async getCategoryNameMap(idToken?: string): Promise<Record<string, string>> {
    const categories = await this.firestoreDataService.categories.list(idToken);

    return categories.reduce<Record<string, string>>((map, category) => {
      map[category.name.toLowerCase()] = category.id;
      return map;
    }, {});
  }

  async findPotentialDuplicateKeys(idToken?: string): Promise<{ duplicateKeys: Set<string>; emailKeys: Set<string> }> {
    const providers = await this.firestoreDataService.serviceProviders.list(idToken);

    return providers.reduce(
      (acc, provider) => {
        acc.duplicateKeys.add(`${provider.fullName.toLowerCase()}::${provider.phone.toLowerCase()}`);

        if (provider.email) {
          acc.emailKeys.add(provider.email.toLowerCase());
        }

        return acc;
      },
      { duplicateKeys: new Set<string>(), emailKeys: new Set<string>() }
    );
  }
}
