import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommunityProjectDocument, CommunityProjectStatus } from '../../../../core/firebase/models/firestore-data.models';
import { CommunityProjectAdminService } from './community-project-admin.service';

@Component({ selector: 'app-admin-projects-page', standalone: true, imports: [RouterLink], templateUrl: './admin-projects-page.component.html', styleUrl: './admin-projects-page.component.scss' })
export class AdminProjectsPageComponent implements OnInit {
  readonly projects = signal<CommunityProjectDocument[]>([]);
  readonly loading = signal(true); readonly error = signal(''); readonly busyId = signal('');
  constructor(private readonly admin: CommunityProjectAdminService) {}
  async ngOnInit(): Promise<void> { await this.refresh(); }
  async publication(project: CommunityProjectDocument): Promise<void> { await this.act(project, () => this.admin.setPublication(project, project.publicationState === 'published' ? 'draft' : 'published')); }
  async status(project: CommunityProjectDocument, status: CommunityProjectStatus): Promise<void> { await this.act(project, () => this.admin.setStatus(project, status)); }
  async feature(project: CommunityProjectDocument): Promise<void> { await this.act(project, () => this.admin.setFeatured(project, !project.featured)); }
  async remove(project: CommunityProjectDocument): Promise<void> { if (confirm(`Permanently delete “${project.title}”?`)) await this.act(project, () => this.admin.delete(project)); }
  private async act(project: CommunityProjectDocument, action: () => Promise<unknown>): Promise<void> { this.busyId.set(project.id); this.error.set(''); try { await action(); await this.refresh(); } catch (error) { this.error.set(error instanceof Error ? error.message : 'The project could not be updated.'); } finally { this.busyId.set(''); } }
  private async refresh(): Promise<void> { this.loading.set(true); try { this.projects.set(await this.admin.list()); } catch (error) { this.error.set(error instanceof Error ? error.message : 'Projects could not be loaded.'); } finally { this.loading.set(false); } }
}
