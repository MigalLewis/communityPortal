import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ResourceCategoryDocument, ResourceDocument } from '../../../../core/firebase/models/firestore-data.models';
import { ResourceAdminService, ResourceInput } from './resource-admin.service';

@Component({ selector: 'app-admin-resources-page', standalone: true, imports: [FormsModule], templateUrl: './admin-resources-page.component.html', styleUrl: './admin-resources-page.component.scss' })
export class AdminResourcesPageComponent implements OnInit {
  readonly resources = signal<ResourceDocument[]>([]); readonly categories = signal<ResourceCategoryDocument[]>([]);
  readonly error = signal(''); readonly busy = signal(false); query = ''; editing?: ResourceDocument; file?: File;
  form: ResourceInput = this.blank();
  constructor(private readonly admin: ResourceAdminService) {}
  async ngOnInit(): Promise<void> { await this.refresh(); }
  get filtered(): ResourceDocument[] { const q = this.query.trim().toLowerCase(); return this.resources().filter(item => !q || `${item.title} ${item.description}`.toLowerCase().includes(q)); }
  edit(item: ResourceDocument): void { this.editing = item; this.form = { title: item.title, slug: item.slug, categoryId: item.categoryId, description: item.description,
    publicationDate: item.publicationDate.slice(0, 10), publicationState: item.publicationState, accessMode: item.accessMode, requestReason: item.requestReason,
    featured: item.featured, quickLink: item.quickLink }; this.file = undefined; }
  create(): void { this.editing = undefined; this.form = this.blank(); this.file = undefined; }
  choose(event: Event): void { this.file = (event.target as HTMLInputElement).files?.[0]; }
  async save(): Promise<void> { await this.act(async () => { await this.admin.save(this.form, this.editing, this.file); this.create(); }); }
  async publish(item: ResourceDocument): Promise<void> { await this.act(() => this.admin.setState(item, 'published')); }
  async archive(item: ResourceDocument): Promise<void> { await this.act(() => this.admin.setState(item, 'archived')); }
  async quick(item: ResourceDocument): Promise<void> { await this.act(() => this.admin.toggleQuickLink(item)); }
  async remove(item: ResourceDocument): Promise<void> { if (confirm(`Delete “${item.title}”?`)) await this.act(() => this.admin.delete(item)); }
  private async act(action: () => Promise<unknown>): Promise<void> { this.busy.set(true); this.error.set(''); try { await action(); await this.refresh(); } catch (e) { this.error.set(e instanceof Error ? e.message : 'The resource could not be updated.'); } finally { this.busy.set(false); } }
  private async refresh(): Promise<void> { const [resources, categories] = await Promise.all([this.admin.list(), this.admin.categories()]); this.resources.set(resources); this.categories.set(categories); }
  private blank(): ResourceInput { return { title: '', slug: '', categoryId: '', description: '', publicationDate: new Date().toISOString().slice(0, 10), publicationState: 'draft', accessMode: 'download', featured: false, quickLink: false }; }
}
