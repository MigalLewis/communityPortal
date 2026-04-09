import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContractorFilters } from './models/contractor.model';
import { MOCK_CONTRACTORS } from './data/mock-contractors';
import { filterContractors } from './services/contractor-filter.util';

@Component({
  selector: 'app-contractor-directory-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contractor-directory-page.component.html',
  styleUrl: './contractor-directory-page.component.scss'
})
export class ContractorDirectoryPageComponent {
  readonly contractors = MOCK_CONTRACTORS;
  readonly categories = [...new Set(MOCK_CONTRACTORS.map((contractor) => contractor.category))];
  readonly areas = [...new Set(MOCK_CONTRACTORS.map((contractor) => contractor.area))];
  readonly tags = [...new Set(MOCK_CONTRACTORS.flatMap((contractor) => contractor.tags))].sort();

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
