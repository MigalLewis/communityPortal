import { Injectable } from '@angular/core';
import { ResourceCategoryDocument, ResourceDocument } from '../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';

@Injectable({ providedIn: 'root' })
export class PublicResourceRepository {
  constructor(private readonly data: FirestoreDataService) {}

  async load(): Promise<{ categories: ResourceCategoryDocument[]; resources: ResourceDocument[] }> {
    const [categories, resources] = await Promise.all([
      this.data.listPublishedResourceCategories(), this.data.listPublishedResources()
    ]);
    return {
      categories: categories.sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title)),
      resources: resources.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate))
    };
  }
}

export function filterResources(resources: ResourceDocument[], query: string, categoryId: string, sort: string): ResourceDocument[] {
  const needle = query.trim().toLocaleLowerCase();
  return resources.filter(resource => (!categoryId || resource.categoryId === categoryId)
      && (!needle || `${resource.title} ${resource.description}`.toLocaleLowerCase().includes(needle)))
    .sort((a, b) => sort === 'title' ? a.title.localeCompare(b.title) : b.publicationDate.localeCompare(a.publicationDate));
}
