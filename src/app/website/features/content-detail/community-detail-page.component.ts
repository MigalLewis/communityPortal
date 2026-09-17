import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { COMMUNITY_RESOURCES, CommunityContent, findBySlug } from '../../content/community-content';
import { PublicCommunityContentRepository } from '../../services/public-community-content.repository';

@Component({ selector: 'app-community-detail-page', standalone: true, imports: [RouterLink], template: `
  @if (loading()) { <main class="detail-page"><p>Loading…</p></main> }
  @else if (error()) { <main class="detail-page"><p role="alert">{{ error() }}</p><a routerLink="/our-community">← Our community</a></main> }
  @else { @if (content(); as item) { <main class="detail-page"><article class="detail"><p class="eyebrow">{{ item.eyebrow }}</p><h1>{{ item.title }}</h1><p class="lead">{{ item.summary }}</p><div class="body">@for (paragraph of item.details; track paragraph) { <p>{{ paragraph }}</p> }</div><div class="actions"><a routerLink="/our-community">← Our community</a>@if (kind === 'heritage') { <a href="https://joburgheritage.org.za/" target="_blank" rel="noopener">Johannesburg Heritage Foundation</a> } @if (kind === 'maps') { <a href="https://www.google.com/maps/search/?api=1&query=Parktown+North%2C+Johannesburg" target="_blank" rel="noopener">Open authoritative map</a> }<a href="mailto:parktownnorthra@gmail.com?subject=Request information: {{ item.title }}">Request information</a></div></article></main> } }
`, styleUrl: './content-detail.component.scss' })
export class CommunityDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(PublicCommunityContentRepository);
  protected readonly kind = this.route.snapshot.data['kind'] as string;
  protected readonly content = signal<CommunityContent | undefined>(undefined);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  async ngOnInit(): Promise<void> {
    const slug = this.route.snapshot.paramMap.get('slug');
    try {
      if (this.kind === 'portfolios' && slug) {
        const portfolio = await this.repository.findPortfolioBySlug(slug);
        if (portfolio) this.content.set({ slug: portfolio.slug, title: portfolio.title || portfolio.name, eyebrow: 'PNRA portfolio', summary: portfolio.description, details: portfolio.details });
      } else this.content.set(findBySlug(COMMUNITY_RESOURCES[this.kind] ?? [], slug));
      if (!this.content()) await this.router.navigateByUrl('/our-community');
    } catch { this.error.set('This community information could not be loaded.'); }
    finally { this.loading.set(false); }
  }
}
