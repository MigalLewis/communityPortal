import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CommunityPortfolio {
  slug: string;
  icon: string;
  title: string;
  description: string;
}

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
export class LandingPageComponent {
  protected readonly portfolios: CommunityPortfolio[] = [
    {
      slug: 'civic-affairs', icon: '⌂',
      title: 'Civic Affairs',
      description: 'Managing relationships with municipal bodies and ensuring service delivery standards are met.'
    },
    {
      slug: 'environmental-affairs', icon: '◒',
      title: 'Environmental Affairs',
      description: 'Protecting our urban forest, managing waste, and promoting sustainable community practices.'
    },
    {
      slug: 'town-planning-and-heritage', icon: '△',
      title: 'Town Planning & Heritage',
      description: 'Safeguarding the architectural integrity and historic value of Parktown North properties.'
    }
  ];

  protected readonly services: ResidentService[] = [
    { route: '/resident-services', icon: '!', title: 'Report an Issue', description: 'JRA, Water, or Power', tone: 'green' },
    { route: '/security', icon: '+', title: 'Emergency Contacts', description: 'Security & Fire Services', tone: 'rose' },
    { route: '/resources', icon: '♻', title: 'Recycling Schedule', description: 'Project Recycle details', tone: 'sage' },
    { route: '/events', icon: '□', title: 'Upcoming Events', description: 'Community gatherings', tone: 'gold' }
  ];

}
