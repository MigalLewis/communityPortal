import { Component, OnInit } from '@angular/core';
import { ResourceCategoryDocument, ResourceDocument } from '../../../core/firebase/models/firestore-data.models';
import { filterResources, PublicResourceRepository } from './public-resource.repository';

@Component({ selector: 'app-resources-page', standalone: true, templateUrl: './resources-page.component.html', styleUrl: './resources-page.component.scss' })
export class ResourcesPageComponent implements OnInit {
  protected categories: ResourceCategoryDocument[] = [];
  protected documents: ResourceDocument[] = [];
  protected query = '';
  protected activeCategory = '';
  protected sort = 'newest';
  protected visibleCount = 6;
  protected loading = true;
  protected error = '';

  constructor(private readonly repository: PublicResourceRepository) {}
  async ngOnInit(): Promise<void> {
    try { const library = await this.repository.load(); this.categories = library.categories; this.documents = library.resources; }
    catch { this.error = 'The resource library could not be loaded. Please try again later.'; }
    finally { this.loading = false; }
  }
  protected get filteredDocuments(): ResourceDocument[] { return filterResources(this.documents, this.query, this.activeCategory, this.sort); }
  protected get visibleDocuments(): ResourceDocument[] { return this.filteredDocuments.slice(0, this.visibleCount); }
  protected get quickLinks(): ResourceDocument[] { return this.documents.filter(item => item.quickLink); }
  protected categoryTitle(id: string): string { return this.categories.find(category => category.id === id)?.title ?? 'Resources'; }
  protected selectCategory(id: string): void { this.activeCategory = this.activeCategory === id ? '' : id; this.visibleCount = 6; }
  protected updateSearch(event: Event): void { this.query = (event.target as HTMLInputElement).value; this.visibleCount = 6; }
  protected updateSort(event: Event): void { this.sort = (event.target as HTMLSelectElement).value; }
  protected loadMore(): void { this.visibleCount += 6; }
  protected followQuickLink(resource: ResourceDocument): void { this.query = resource.title; this.activeCategory = ''; this.visibleCount = 6; }
  protected publicationLabel(date: string): string { return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date)); }
  protected fileSizeLabel(bytes: number): string { return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
  protected requestUrl(resource: ResourceDocument): string { return `mailto:parktownnorthra@gmail.com?subject=${encodeURIComponent(`Request document: ${resource.title}`)}&body=${encodeURIComponent(resource.requestReason ?? '')}`; }
}
