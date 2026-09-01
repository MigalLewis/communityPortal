import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Contractor, ContractorFilters } from './models/contractor.model';
import { filterContractors } from './services/contractor-filter.util';
import { ContractorRepository } from './services/contractor.repository';

@Component({
  selector: 'app-contractor-directory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contractor-directory-page.component.html',
  styleUrl: './contractor-directory-page.component.scss'
})
export class ContractorDirectoryPageComponent implements OnInit {
  contractors: Contractor[] = [];
  categories: string[] = [];
  areas: string[] = [];
  tags: string[] = [];
  loading = true;
  loadError = '';
  constructor(private readonly repository: ContractorRepository) {}
  async ngOnInit(): Promise<void> {
    try {
      this.contractors = await this.repository.listPublic();
      this.categories = [...new Set(this.contractors.flatMap((item) => item.categoryIds))].sort();
      this.areas = [...new Set(this.contractors.flatMap((item) => item.serviceAreas))].sort();
      this.tags = [...new Set(this.contractors.flatMap((item) => item.services))].sort();
    } catch { this.loadError = 'The contractor directory is temporarily unavailable.'; }
    finally { this.loading = false; }
  }

  showFilters = true;

  readonly filters: ContractorFilters = {
    search: '',
    category: '',
    tag: '',
    verifiedOnly: false,
    availableToday: false,
    minRating: 0,
    area: ''
  };

  get filteredContractors() {
    return filterContractors(this.contractors, this.filters);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  clearFilters(): void {
    this.filters.search = '';
    this.filters.category = '';
    this.filters.tag = '';
    this.filters.verifiedOnly = false;
    this.filters.availableToday = false;
    this.filters.minRating = 0;
    this.filters.area = '';
  }
}
