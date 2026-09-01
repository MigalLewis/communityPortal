import { Component } from '@angular/core';

interface ResourceDocument {
  id: string;
  title: string;
  category: string;
  publishedOn: string;
  fileSizeBytes?: number;
  filename: string;
  documentUrl?: string;
  previewUrl?: string;
  description: string;
  requestReason?: string;
}

interface QuickLink { label: string; documentId: string; }

@Component({ selector: 'app-resources-page', standalone: true, templateUrl: './resources-page.component.html', styleUrl: './resources-page.component.scss' })
export class ResourcesPageComponent {
  protected readonly categories = [
    ['⌂', 'Town Planning & Heritage'], ['◒', 'Municipal Services'], ['▤', 'AGM & PNRA Documents'],
    ['⚖', 'By-Laws'], ['◆', 'Security'], ['♧', 'Environment'], ['♣', 'Pets'],
    ['§', 'PAIA & Governance'], ['☷', 'Forms']
  ];
  protected query = '';
  protected activeCategory = '';
  protected sort = 'newest';
  protected visibleCount = 3;

  /** Maintained metadata for versioned files in public/documents. Restricted records deliberately omit file metadata. */
  protected readonly documents: ResourceDocument[] = [
    { id: 'membership-form-2026', title: 'PNRA Membership Form 2026', category: 'Forms', publishedOn: '2026-08-01', fileSizeBytes: 666, filename: 'pnra-membership-form-2026.pdf', documentUrl: '/documents/pnra-membership-form-2026.pdf', previewUrl: '/documents/pnra-membership-form-2026.pdf', description: 'Official application form for new members or membership renewals.' },
    { id: 'heritage-guidelines-2026', title: 'Heritage Application Guidelines', category: 'Town Planning & Heritage', publishedOn: '2026-07-01', fileSizeBytes: 687, filename: 'heritage-application-guidelines-2026.pdf', documentUrl: '/documents/heritage-application-guidelines-2026.pdf', previewUrl: '/documents/heritage-application-guidelines-2026.pdf', description: 'A guide to submitting renovation plans for heritage properties.' },
    { id: 'agm-minutes-2026', title: '2026 AGM Minutes', category: 'AGM & PNRA Documents', publishedOn: '2026-03-18', filename: 'pnra-agm-minutes-2026.pdf', description: 'Official minutes and resolutions from the Annual General Meeting.', requestReason: 'Minutes containing protected personal information are supplied after an access review.' },
    { id: 'noise-control-bylaws-2026', title: 'City Noise Control By-Laws', category: 'By-Laws', publishedOn: '2026-01-15', fileSizeBytes: 685, filename: 'city-noise-control-by-laws-2026.pdf', documentUrl: '/documents/city-noise-control-by-laws-2026.pdf', description: 'Municipal regulations relating to neighbourhood noise and disturbances.' },
    { id: 'paia-manual-2025', title: 'PAIA Manual', category: 'PAIA & Governance', publishedOn: '2025-11-10', fileSizeBytes: 667, filename: 'pnra-paia-manual-2025.pdf', documentUrl: '/documents/pnra-paia-manual-2025.pdf', previewUrl: '/documents/pnra-paia-manual-2025.pdf', description: 'PNRA access-to-information manual and request guidance.' },
    { id: 'pet-ownership-guide-2025', title: 'Responsible Pet Ownership Guide', category: 'Pets', publishedOn: '2025-09-05', filename: 'responsible-pet-ownership-guide-2025.pdf', description: 'Practical guidance and local rules for pet owners.', requestReason: 'This third-party publication cannot be redistributed by PNRA.' }
  ];

  protected readonly quickLinks: QuickLink[] = [
    { label: 'Membership Form', documentId: 'membership-form-2026' },
    { label: 'Heritage Applications', documentId: 'heritage-guidelines-2026' },
    { label: 'AGM Minutes', documentId: 'agm-minutes-2026' },
    { label: 'By-Laws', documentId: 'noise-control-bylaws-2026' },
    { label: 'PAIA Manual', documentId: 'paia-manual-2025' }
  ];

  protected get filteredDocuments(): ResourceDocument[] {
    const query = this.query.trim().toLowerCase();
    const filtered = this.documents.filter((document) => {
      const matchesSearch = !query || `${document.title} ${document.category} ${document.description}`.toLowerCase().includes(query);
      return matchesSearch && (!this.activeCategory || document.category === this.activeCategory);
    });
    return filtered.sort((a, b) => this.sort === 'title' ? a.title.localeCompare(b.title) : b.publishedOn.localeCompare(a.publishedOn));
  }

  protected get visibleDocuments(): ResourceDocument[] { return this.filteredDocuments.slice(0, this.visibleCount); }
  protected selectCategory(category: string): void { this.activeCategory = this.activeCategory === category ? '' : category; this.visibleCount = 3; }
  protected updateSearch(event: Event): void { this.query = (event.target as HTMLInputElement).value; this.visibleCount = 3; }
  protected updateSort(event: Event): void { this.sort = (event.target as HTMLSelectElement).value; }
  protected loadMore(): void { this.visibleCount += 3; }
  protected followQuickLink(documentId: string): void {
    this.query = this.documents.find((document) => document.id === documentId)?.title ?? '';
    this.activeCategory = '';
    this.visibleCount = 3;
  }
  protected publicationLabel(publishedOn: string): string {
    return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${publishedOn}T00:00:00Z`));
  }
  protected fileSizeLabel(bytes: number): string { return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`; }
  protected requestUrl(document: ResourceDocument): string {
    return `mailto:parktownnorthra@gmail.com?subject=${encodeURIComponent(`Request document: ${document.title}`)}`;
  }
}
