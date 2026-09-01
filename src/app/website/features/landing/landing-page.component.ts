import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SiteFooterComponent } from '../../components/site-footer/site-footer.component';
import { SiteHeaderComponent } from '../../components/site-header/site-header.component';

interface CommunityPortfolio {
  icon: string;
  title: string;
  description: string;
}

interface ResidentService {
  icon: string;
  title: string;
  description: string;
  tone: 'green' | 'rose' | 'sage' | 'gold';
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, SiteHeaderComponent, SiteFooterComponent],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent {
  protected readonly portfolios: CommunityPortfolio[] = [
    {
      icon: '⌂',
      title: 'Civic Affairs',
      description: 'Managing relationships with municipal bodies and ensuring service delivery standards are met.'
    },
    {
      icon: '◒',
      title: 'Environmental Affairs',
      description: 'Protecting our urban forest, managing waste, and promoting sustainable community practices.'
    },
    {
      icon: '△',
      title: 'Town Planning & Heritage',
      description: 'Safeguarding the architectural integrity and historic value of Parktown North properties.'
    }
  ];

  protected readonly services: ResidentService[] = [
    { icon: '!', title: 'Report an Issue', description: 'JRA, Water, or Power', tone: 'green' },
    { icon: '+', title: 'Emergency Contacts', description: 'Security & Fire Services', tone: 'rose' },
    { icon: '♻', title: 'Recycling Schedule', description: 'Project Recycle details', tone: 'sage' },
    { icon: '□', title: 'Upcoming Events', description: 'Community gatherings', tone: 'gold' }
  ];

}
