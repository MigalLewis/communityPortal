import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommitteeMemberDocument, CommunityPortfolioDocument } from '../../../core/firebase/models/firestore-data.models';
import { PublicCommunityContentRepository } from '../../services/public-community-content.repository';

@Component({
  selector: 'app-our-community-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './our-community-page.component.html',
  styleUrl: './our-community-page.component.scss'
})
export class OurCommunityPageComponent implements OnInit {
  protected readonly portfolios = signal<CommunityPortfolioDocument[]>([]);
  protected readonly committee = signal<CommitteeMemberDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  constructor(private readonly repository: PublicCommunityContentRepository) {}

  async ngOnInit(): Promise<void> {
    try {
      const [portfolios, committee] = await Promise.all([this.repository.listPortfolios(), this.repository.listCommitteeMembers()]);
      this.portfolios.set(portfolios); this.committee.set(committee);
    } catch { this.error.set('Community information could not be loaded. Please try again later.'); }
    finally { this.loading.set(false); }
  }
  protected readonly missionItems = [
    { icon: '◆', label: 'Protect our neighbourhood' },
    { icon: '♧', label: 'Preserve our environment' },
    { icon: '⌾', label: 'Promote safety' },
    { icon: '●', label: 'Represent residents' },
    { icon: '◇', label: 'Strengthen community' },
    { icon: '◖', label: 'Keep residents informed' }
  ];

}
