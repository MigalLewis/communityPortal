import { Injectable } from '@angular/core';
import { CommitteeMemberDocument, CommunityPortfolioDocument } from '../../core/firebase/models/firestore-data.models';
import { FirestoreDataService } from '../../core/firebase/services/firestore-data.service';

@Injectable({ providedIn: 'root' })
export class PublicCommunityContentRepository {
  constructor(private readonly data: FirestoreDataService) {}

  listCommitteeMembers(): Promise<CommitteeMemberDocument[]> {
    return this.data.listPublishedCommitteeMembers();
  }

  listPortfolios(): Promise<CommunityPortfolioDocument[]> {
    return this.data.listPublishedCommunityPortfolios();
  }

  async findPortfolioBySlug(slug: string): Promise<CommunityPortfolioDocument | undefined> {
    return (await this.listPortfolios()).find(portfolio => portfolio.slug === slug);
  }
}
