import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Portfolio {
  icon: string;
  title: string;
  description: string;
}

interface CommitteeMember {
  initials: string;
  name: string;
  role: string;
  description: string;
}

@Component({
  selector: 'app-our-community-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './our-community-page.component.html',
  styleUrl: './our-community-page.component.scss'
})
export class OurCommunityPageComponent {
  protected readonly missionItems = [
    { icon: '◆', label: 'Protect our neighbourhood' },
    { icon: '♧', label: 'Preserve our environment' },
    { icon: '⌾', label: 'Promote safety' },
    { icon: '●', label: 'Represent residents' },
    { icon: '◇', label: 'Strengthen community' },
    { icon: '◖', label: 'Keep residents informed' }
  ];

  protected readonly portfolios: Portfolio[] = [
    { icon: '⌂', title: 'Civic Affairs', description: 'Liaising with municipal entities regarding service delivery, infrastructure maintenance, and local government initiatives.' },
    { icon: '♧', title: 'Environmental Affairs', description: 'Protecting our parks, coordinating tree planting, managing waste initiatives, and preserving the natural beauty of the suburb.' },
    { icon: '⬡', title: 'Security', description: 'Collaborating with local security providers, SAPS, and community surveillance networks to help keep residents safe.' },
    { icon: '△', title: 'Town Planning & Heritage', description: 'Monitoring development applications, protecting heritage structures, and encouraging adherence to zoning regulations.' },
    { icon: '◌', title: 'Community Forums', description: 'Facilitating communication, hosting town halls, and managing platforms for resident engagement and updates.' },
    { icon: '⚒', title: 'Projects', description: 'Leading park upgrades, public-space beautification, and community infrastructure improvements.' }
  ];

  protected readonly committee: CommitteeMember[] = [
    { initials: 'JD', name: 'Jane Doe', role: 'Chairperson', description: 'Oversees general operations and the strategic direction of the PNRA.' },
    { initials: 'JS', name: 'John Smith', role: 'Security Portfolio', description: 'Manages relationships with security providers and SAPS.' },
    { initials: 'SL', name: 'Sarah Lee', role: 'Environmental Affairs', description: 'Leads park maintenance and community greening initiatives.' },
    { initials: 'DC', name: 'David Chen', role: 'Town Planning', description: 'Reviews development proposals and protects heritage assets.' }
  ];
}
