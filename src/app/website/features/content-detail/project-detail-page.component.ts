import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommunityProjectDocument } from '../../../core/firebase/models/firestore-data.models';
import { PublicCommunityProjectsService } from '../projects/public-community-projects.service';

@Component({ selector: 'app-project-detail-page', standalone: true, imports: [RouterLink], template: `
  @if (loading()) { <main class="detail-page"><p class="state" aria-live="polite">Loading community project…</p></main> }
  @else { @if (project(); as item) { <main class="detail-page"><article class="detail"><p class="eyebrow">PNRA community project</p><h1>{{ item.title }}</h1><p class="lead">{{ item.summary }}</p><img class="hero-image" [src]="item.image.url" [alt]="item.image.altText"><div class="meta"><span>{{ statusLabel(item.status) }}</span><span>{{ item.category }}</span><span>{{ item.progress }}% complete</span></div><div class="body"><p>{{ item.content }}</p></div><div class="actions"><a routerLink="/projects">← All projects</a><a href="mailto:parktownnorthra@gmail.com?subject=Request information: {{ item.title }}">Request information</a></div></article></main> } }
`, styleUrl: './content-detail.component.scss' })
export class ProjectDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute); private readonly router = inject(Router); private readonly repository = inject(PublicCommunityProjectsService);
  readonly project = signal<CommunityProjectDocument | null>(null); readonly loading = signal(true);
  async ngOnInit(): Promise<void> { const slug = this.route.snapshot.paramMap.get('slug') ?? ''; try { const project = await this.repository.bySlug(slug); if (!project) { await this.router.navigateByUrl('/projects'); return; } this.project.set(project); } catch { await this.router.navigateByUrl('/projects'); } finally { this.loading.set(false); } }
  statusLabel(status: CommunityProjectDocument['status']): string { return ({ planned: 'Planned', active: 'Active', on_hold: 'On hold', completed: 'Completed', archived: 'Archived' })[status]; }
}
