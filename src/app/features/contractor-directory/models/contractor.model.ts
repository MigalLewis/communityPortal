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

export interface ContractorReview {
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface ContractorProfile {
  id: string;
  yearsInBusiness: number;
  about: string;
  licenses: string[];
  insurance: string;
  responseTime: string;
  completionRate: string;
  verificationBadges: string[];
  services: string[];
  areasServed: string[];
  gallery: string[];
  reviews: ContractorReview[];
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
