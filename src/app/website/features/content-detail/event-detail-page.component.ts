import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EVENTS, findBySlug } from '../../content/community-content';

@Component({ selector: 'app-event-detail-page', standalone: true, imports: [RouterLink], template: `
  @if (event) { <main class="detail-page"><article class="detail"><p class="eyebrow">{{ event.eyebrow }}</p><h1>{{ event.title }}</h1><p class="lead">{{ event.summary }}</p><div class="meta"><span>{{ event.date }}</span><span>{{ event.time }}</span><span>{{ event.location }}</span></div><div class="body">@for (paragraph of event.details; track paragraph) { <p>{{ paragraph }}</p> }</div><div class="actions"><a routerLink="/events">← All events</a><a href="mailto:parktownnorthra@gmail.com?subject=Request information: {{ event.title }}">Request information</a></div></article></main> }
`, styleUrl: './content-detail.component.scss' })
export class EventDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly event = findBySlug(EVENTS, this.route.snapshot.paramMap.get('slug'));
  constructor() { if (!this.event) void this.router.navigateByUrl('/events'); }
}
