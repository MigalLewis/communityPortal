import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdvertDocument } from '../../../core/firebase/models/firestore-data.models';
import { AdvertAdminService } from './advert-admin.service';

@Component({
  selector: 'app-admin-adverts-page',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './admin-adverts-page.component.html',
  styleUrl: './admin-adverts-page.component.scss'
})
export class AdminAdvertsPageComponent implements OnInit {
  readonly adverts = signal<AdvertDocument[]>([]);
  readonly error = signal('');
  readonly busyId = signal('');

  constructor(private readonly advertsAdmin: AdvertAdminService) {}

  async ngOnInit(): Promise<void> { await this.refresh(); }

  async changeStatus(advert: AdvertDocument, status: 'scheduled' | 'active' | 'inactive'): Promise<void> {
    this.busyId.set(advert.id);
    this.error.set('');
    try {
      await this.advertsAdmin.setStatus(advert, status);
      await this.refresh();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : 'The advert could not be updated.');
    } finally {
      this.busyId.set('');
    }
  }

  private async refresh(): Promise<void> {
    try { this.adverts.set(await this.advertsAdmin.list()); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Adverts could not be loaded.'); }
  }
}
