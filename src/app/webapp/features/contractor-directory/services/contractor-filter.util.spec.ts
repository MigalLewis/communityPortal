import { ContractorDocument } from '../../../../core/firebase/models/firestore-data.models';
import { ContractorFilters } from '../models/contractor.model';
import { filterContractors } from './contractor-filter.util';
const contractor = (id: string, extra: Partial<ContractorDocument> = {}): ContractorDocument => ({ id, userId: id, fullName: id, businessName: `${id} Co`, categoryIds: ['Electrical'], services: ['Smart Home'], serviceAreas: ['Central'], rating: 4.8, reviewCount: 2, verified: true, bio: '', status: 'active', approvalStatus: 'approved', profileVisibility: 'public', jobAvailability: 'available', contactPreferences: { preferredMethod: 'platform' }, portfolioMedia: [], createdAt: '2026-01-01', updatedAt: '2026-01-01', ...extra });
const filters: ContractorFilters = { search: '', category: '', tag: '', verifiedOnly: false, availableToday: false, minRating: 0, area: '' };
describe('filterContractors', () => {
 it('searches presentation and service fields', () => expect(filterContractors([contractor('one')], { ...filters, search: 'smart home' }).length).toBe(1));
 it('filters availability, verification, area and rating', () => expect(filterContractors([contractor('one'), contractor('two', { jobAvailability: 'unavailable' })], { ...filters, availableToday: true, verifiedOnly: true, area: 'Central', minRating: 4.5 }).map(x => x.id)).toEqual(['one']));
});
