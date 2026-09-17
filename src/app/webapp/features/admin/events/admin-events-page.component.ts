import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { EventDocument, EventPublicationStatus } from '../../../../core/firebase/models/firestore-data.models';
import { EventAdminService } from './event-admin.service';

@Component({ selector: 'app-admin-events-page', standalone: true, imports: [DatePipe, RouterLink], templateUrl: './admin-events-page.component.html', styleUrl: './admin-events-page.component.scss' })
export class AdminEventsPageComponent implements OnInit {
  readonly events = signal<EventDocument[]>([]); readonly loading = signal(true); readonly error = signal(''); readonly busyId = signal('');
  constructor(private readonly admin: EventAdminService) {}
  async ngOnInit(): Promise<void> { await this.refresh(); }
  async status(event: EventDocument, status: EventPublicationStatus): Promise<void> { await this.act(event, () => this.admin.setStatus(event, status)); }
  async feature(event: EventDocument): Promise<void> { await this.act(event, () => this.admin.setFeatured(event, !event.featured)); }
  async remove(event: EventDocument): Promise<void> { if (confirm(`Permanently delete “${event.title}”?`)) await this.act(event, () => this.admin.delete(event)); }
  private async act(event: EventDocument, action: () => Promise<unknown>): Promise<void> { this.busyId.set(event.id); this.error.set(''); try { await action(); await this.refresh(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'The event could not be updated.'); } finally { this.busyId.set(''); } }
  private async refresh(): Promise<void> { this.loading.set(true); try { this.events.set(await this.admin.list()); } catch (e) { this.error.set(e instanceof Error ? e.message : 'Events could not be loaded.'); } finally { this.loading.set(false); } }
}
