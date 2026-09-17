import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommunityPortfolioDocument } from '../../../core/firebase/models/firestore-data.models';
import { PublicCommunityContentRepository } from '../../services/public-community-content.repository';

interface ResidentService {
  route: string;
  icon: string;
  title: string;
  description: string;
  tone: 'green' | 'rose' | 'sage' | 'gold';
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit {
  protected readonly portfolios = signal<CommunityPortfolioDocument[]>([]);
  protected readonly portfoliosLoading = signal(true);
  protected readonly portfoliosError = signal('');
  constructor(private readonly repository: PublicCommunityContentRepository) {}
  async ngOnInit(): Promise<void> { try { this.portfolios.set((await this.repository.listPortfolios()).slice(0, 3)); }
    catch { this.portfoliosError.set('Portfolios could not be loaded.'); } finally { this.portfoliosLoading.set(false); } }

  protected readonly services: ResidentService[] = [
    { route: '/resident-services', icon: '!', title: 'Report an Issue', description: 'JRA, Water, or Power', tone: 'green' },
    { route: '/security', icon: '+', title: 'Emergency Contacts', description: 'Security & Fire Services', tone: 'rose' },
    { route: '/resources', icon: '♻', title: 'Recycling Schedule', description: 'Project Recycle details', tone: 'sage' },
    { route: '/events', icon: '□', title: 'Upcoming Events', description: 'Community gatherings', tone: 'gold' }
  ];

}
