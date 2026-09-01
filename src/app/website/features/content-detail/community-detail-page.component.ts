import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { COMMUNITY_RESOURCES, findBySlug, PORTFOLIOS } from '../../content/community-content';

@Component({ selector: 'app-community-detail-page', standalone: true, imports: [RouterLink], template: `
  @if (content) { <main class="detail-page"><article class="detail"><p class="eyebrow">{{ content.eyebrow }}</p><h1>{{ content.title }}</h1><p class="lead">{{ content.summary }}</p><div class="body">@for (paragraph of content.details; track paragraph) { <p>{{ paragraph }}</p> }</div><div class="actions"><a routerLink="/our-community">← Our community</a>@if (kind === 'heritage') { <a href="https://joburgheritage.org.za/" target="_blank" rel="noopener">Johannesburg Heritage Foundation</a> } @if (kind === 'maps') { <a href="https://www.google.com/maps/search/?api=1&query=Parktown+North%2C+Johannesburg" target="_blank" rel="noopener">Open authoritative map</a> }<a href="mailto:parktownnorthra@gmail.com?subject=Request information: {{ content.title }}">Request information</a></div></article></main> }
`, styleUrl: './content-detail.component.scss' })
export class CommunityDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly kind = this.route.snapshot.data['kind'] as string;
  private readonly items = this.kind === 'portfolios' ? PORTFOLIOS : COMMUNITY_RESOURCES[this.kind] ?? [];
  protected readonly content = findBySlug(this.items, this.route.snapshot.paramMap.get('slug'));
  constructor() { if (!this.content) void this.router.navigateByUrl('/our-community'); }
}
