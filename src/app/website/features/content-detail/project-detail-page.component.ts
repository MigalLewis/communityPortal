import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { findBySlug, PROJECTS } from '../../content/community-content';

@Component({ selector: 'app-project-detail-page', standalone: true, imports: [RouterLink], template: `
  @if (project) { <main class="detail-page"><article class="detail"><p class="eyebrow">{{ project.eyebrow }}</p><h1>{{ project.title }}</h1><p class="lead">{{ project.summary }}</p><div class="meta"><span>{{ project.status }}</span><span>{{ project.category }}</span></div><div class="body">@for (paragraph of project.details; track paragraph) { <p>{{ paragraph }}</p> }</div><div class="actions"><a routerLink="/projects">← All projects</a><a href="mailto:parktownnorthra@gmail.com?subject=Request information: {{ project.title }}">Request information</a></div></article></main> }
`, styleUrl: './content-detail.component.scss' })
export class ProjectDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly project = findBySlug(PROJECTS, this.route.snapshot.paramMap.get('slug'));
  constructor() { if (!this.project) void this.router.navigateByUrl('/projects'); }
}
