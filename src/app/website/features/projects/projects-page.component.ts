import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ProjectCategory = 'Environment' | 'Infrastructure' | 'Safety' | 'Community';
type ProjectStatus = 'Ongoing' | 'Completed';

interface Project {
  title: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  image: string;
}

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './projects-page.component.html',
  styleUrl: './projects-page.component.scss'
})
export class ProjectsPageComponent {
  protected readonly filters = ['All', 'Environment', 'Infrastructure', 'Safety', 'Community', 'Completed'];
  protected activeFilter = 'All';

  protected readonly projects: Project[] = [
    {
      title: 'Pocket Park',
      description: 'Creating sustainable micro-parks throughout the neighbourhood to enhance local biodiversity.',
      category: 'Environment',
      status: 'Ongoing',
      image: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?auto=format&fit=crop&w=900&q=85'
    },
    {
      title: 'Adopt-a-Box',
      description: 'Beautifying street infrastructure through community-sponsored art on utility boxes.',
      category: 'Infrastructure',
      status: 'Ongoing',
      image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=85'
    },
    {
      title: 'Bollard Project',
      description: 'Installing protective bollards along key pedestrian routes to make everyday journeys safer.',
      category: 'Safety',
      status: 'Completed',
      image: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=85'
    },
    {
      title: 'Community-in-Action Squad',
      description: 'A rapid-response volunteer group addressing minor maintenance issues across the suburb.',
      category: 'Community',
      status: 'Ongoing',
      image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85'
    }
  ];

  protected get filteredProjects(): Project[] {
    if (this.activeFilter === 'All') return this.projects;
    if (this.activeFilter === 'Completed') return this.projects.filter(({ status }) => status === 'Completed');
    return this.projects.filter(({ category }) => category === this.activeFilter);
  }

  protected selectFilter(filter: string): void {
    this.activeFilter = filter;
  }
}
