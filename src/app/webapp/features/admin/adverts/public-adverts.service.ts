import { Injectable } from '@angular/core';
import { AdvertDocument, AdvertPlacement } from '../../../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../../../core/firebase/services/firestore-data.service';

export function filterPublicAdverts(adverts: AdvertDocument[], now = new Date(), placement?: AdvertPlacement): AdvertDocument[] {
  const instant = now.getTime();
  return adverts
    .filter((advert) => advert.status === 'active'
      && Date.parse(advert.startAt) <= instant
      && instant <= Date.parse(advert.endAt)
      && (!placement || advert.placement === placement))
    .sort((a, b) => b.sortPriority - a.sortPriority || a.startAt.localeCompare(b.startAt));
}

/** Public read-only advert API; marketplace entities must never be introduced here. */
@Injectable({ providedIn: 'root' })
export class PublicAdvertsService {
  constructor(private readonly data: FirestoreDataService) {}

  async listActive(placement?: AdvertPlacement, now = new Date()): Promise<AdvertDocument[]> {
    return filterPublicAdverts(await this.data.adverts.list(), now, placement);
  }
}
