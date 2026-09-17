import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommunityProjectDocument } from '../../../core/firebase/models/firestore-data.models';
import { PublicCommunityProjectsService } from './public-community-projects.service';

@Component({ selector: 'app-projects-page', standalone: true, imports: [RouterLink], templateUrl: './projects-page.component.html', styleUrl: './projects-page.component.scss' })
export class ProjectsPageComponent implements OnInit {
  readonly projects = signal<CommunityProjectDocument[]>([]); readonly loading = signal(true); readonly error = signal('');
  activeFilter = 'All';
  constructor(private readonly repository: PublicCommunityProjectsService) {}
  async ngOnInit(): Promise<void> { try { this.projects.set(await this.repository.list()); } catch { this.error.set('Community projects could not be loaded. Please try again later.'); } finally { this.loading.set(false); } }
  get featured(): CommunityProjectDocument | null { return this.repository.featured(this.projects()); }
  get filters(): string[] { return ['All', ...new Set(this.projects().map(project => project.category)), 'Completed']; }
  get filteredProjects(): CommunityProjectDocument[] { return this.projects().filter(project => project.id !== this.featured?.id && (this.activeFilter === 'All' || (this.activeFilter === 'Completed' ? project.status === 'completed' : project.category === this.activeFilter))); }
  selectFilter(filter: string): void { this.activeFilter = filter; }
  statusLabel(status: CommunityProjectDocument['status']): string { return ({ planned: 'Planned', active: 'Active', on_hold: 'On hold', completed: 'Completed', archived: 'Archived' })[status]; }
}
