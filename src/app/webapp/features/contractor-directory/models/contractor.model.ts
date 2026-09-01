import { ContractorDocument } from '../../../../core/firebase/models/firestore-data.models';
export type Contractor = ContractorDocument;
export interface ContractorFilters { search: string; category: string; tag: string; verifiedOnly: boolean; availableToday: boolean; minRating: number; area: string; }
