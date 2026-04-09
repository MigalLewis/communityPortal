export interface Contractor {
  id: string;
  name: string;
  company: string;
  category: string;
  area: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  availableToday: boolean;
  phone: string;
  tags: string[];
}

export interface ContractorFilters {
  search: string;
  category: string;
  tag: string;
  verifiedOnly: boolean;
  availableToday: boolean;
  minRating: number;
  area: string;
}
