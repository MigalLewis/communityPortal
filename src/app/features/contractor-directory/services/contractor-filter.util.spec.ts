import { MOCK_CONTRACTORS } from '../data/mock-contractors';
import { ContractorFilters } from '../models/contractor.model';
import { filterContractors } from './contractor-filter.util';

const baseFilters: ContractorFilters = {
  search: '',
  category: '',
  tag: '',
  verifiedOnly: false,
  availableToday: false,
  minRating: 0,
  area: ''
};

describe('filterContractors', () => {
  it('filters by search across name, company, and tags', () => {
    const result = filterContractors(MOCK_CONTRACTORS, { ...baseFilters, search: 'smart home' });

    expect(result.map((contractor) => contractor.name)).toEqual(['Marcus Sterling', 'Lila Morgan']);
  });

  it('filters by verified and available today together', () => {
    const result = filterContractors(MOCK_CONTRACTORS, {
      ...baseFilters,
      verifiedOnly: true,
      availableToday: true
    });

    expect(result.every((contractor) => contractor.verified && contractor.availableToday)).toBeTrue();
  });

  it('applies area and minimum rating constraints', () => {
    const result = filterContractors(MOCK_CONTRACTORS, {
      ...baseFilters,
      area: 'Downtown',
      minRating: 4.7
    });

    expect(result.map((contractor) => contractor.name)).toEqual(['Marcus Sterling']);
  });
});
