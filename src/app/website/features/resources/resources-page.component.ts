import { Component } from '@angular/core';

interface ResourceDocument {
  title: string;
  category: string;
  date: string;
  dateValue: string;
  size: string;
  description: string;
}

@Component({
  selector: 'app-resources-page',
  standalone: true,
  templateUrl: './resources-page.component.html',
  styleUrl: './resources-page.component.scss'
})
export class ResourcesPageComponent {
  protected readonly categories = [
    ['⌂', 'Town Planning & Heritage'], ['◒', 'Municipal Services'],
    ['▤', 'AGM & PNRA Documents'], ['⚖', 'By-Laws'], ['◆', 'Security'],
    ['♧', 'Environment'], ['♣', 'Pets'], ['§', 'PAIA & Governance'],
    ['☷', 'Forms']
  ];
  protected query = '';
  protected activeCategory = '';
  protected sort = 'newest';
  protected visibleCount = 3;

  protected readonly documents: ResourceDocument[] = [
    { title: 'PNRA Membership Form 2026', category: 'Forms', date: 'Aug 2026', dateValue: '2026-08-01', size: '1.2 MB', description: 'Official application form for new members or membership renewals.' },
    { title: 'Heritage Application Guidelines', category: 'Town Planning & Heritage', date: 'Jul 2026', dateValue: '2026-07-01', size: '3.4 MB', description: 'A guide to submitting renovation plans for heritage properties.' },
    { title: '2026 AGM Minutes', category: 'AGM & PNRA Documents', date: 'Mar 2026', dateValue: '2026-03-01', size: '0.8 MB', description: 'Official minutes and resolutions from the Annual General Meeting.' },
    { title: 'City Noise Control By-Laws', category: 'By-Laws', date: 'Jan 2026', dateValue: '2026-01-01', size: '2.1 MB', description: 'Municipal regulations relating to neighbourhood noise and disturbances.' },
    { title: 'PAIA Manual', category: 'PAIA & Governance', date: 'Nov 2025', dateValue: '2025-11-01', size: '0.6 MB', description: 'PNRA access-to-information manual and request guidance.' },
    { title: 'Responsible Pet Ownership Guide', category: 'Pets', date: 'Sep 2025', dateValue: '2025-09-01', size: '1.5 MB', description: 'Practical guidance and local rules for pet owners.' }
  ];

  protected get filteredDocuments(): ResourceDocument[] {
    const query = this.query.trim().toLowerCase();
    const filtered = this.documents.filter((document) => {
      const matchesSearch = !query || `${document.title} ${document.category} ${document.description}`.toLowerCase().includes(query);
      const matchesCategory = !this.activeCategory || document.category === this.activeCategory;
      return matchesSearch && matchesCategory;
    });
    return filtered.sort((a, b) => this.sort === 'title'
      ? a.title.localeCompare(b.title)
      : b.dateValue.localeCompare(a.dateValue));
  }

  protected get visibleDocuments(): ResourceDocument[] { return this.filteredDocuments.slice(0, this.visibleCount); }
  protected selectCategory(category: string): void { this.activeCategory = this.activeCategory === category ? '' : category; this.visibleCount = 3; }
  protected updateSearch(event: Event): void { this.query = (event.target as HTMLInputElement).value; this.visibleCount = 3; }
  protected updateSort(event: Event): void { this.sort = (event.target as HTMLSelectElement).value; }
  protected loadMore(): void { this.visibleCount += 3; }
}
