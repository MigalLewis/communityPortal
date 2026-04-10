import { ServiceProviderDocument } from '../../core/firebase/models/firestore-data.models';

export const PROVIDER_IMPORT_HEADERS = [
  'fullName',
  'businessName',
  'email',
  'phone',
  'area',
  'categories',
  'bio',
  'tags',
  'isVerified',
  'isFeatured',
  'availabilityStatus',
  'alternatePhone',
  'whatsappNumber',
  'suburb',
  'address',
  'notes',
  'website',
  'facebookUrl',
  'instagramUrl'
] as const;

export const REQUIRED_PROVIDER_IMPORT_HEADERS = [
  'fullName',
  'phone',
  'area',
  'categories',
  'isVerified',
  'isFeatured',
  'availabilityStatus'
] as const;

export type ProviderImportHeader = (typeof PROVIDER_IMPORT_HEADERS)[number];
export type AvailabilityStatus = 'available_today' | 'busy' | 'unavailable';

export interface ProviderImportRawRow {
  rowNumber: number;
  values: Partial<Record<ProviderImportHeader, string>>;
}

export interface NormalizedProviderImportRow {
  rowNumber: number;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  alternatePhone: string;
  whatsappNumber: string;
  area: string;
  suburb: string;
  address: string;
  categoryNames: string[];
  bio: string;
  tags: string[];
  isVerified: boolean | null;
  isFeatured: boolean | null;
  availabilityStatus: string;
  notes: string;
  website: string;
  facebookUrl: string;
  instagramUrl: string;
}

export interface ProviderImportValidationIssue {
  type: 'error' | 'warning';
  field?: ProviderImportHeader | 'categories' | 'duplicate';
  message: string;
}

export interface ProviderImportRowResult {
  rowNumber: number;
  source: ProviderImportRawRow;
  normalized: NormalizedProviderImportRow;
  errors: ProviderImportValidationIssue[];
  warnings: ProviderImportValidationIssue[];
  isValid: boolean;
}

export interface ProviderImportValidationSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningCount: number;
  errorCount: number;
}

export interface ProviderImportValidationResult {
  rows: ProviderImportRowResult[];
  summary: ProviderImportValidationSummary;
}

export interface ProviderImportContext {
  knownCategoryMap: Record<string, string>;
  existingDuplicateKeys?: Set<string>;
  existingEmailKeys?: Set<string>;
}

export interface ProviderImportDuplicateProbe {
  fullName: string;
  phone: string;
  email: string;
}

export interface ProviderImportTransformContext {
  adminUserId: string;
  nowIso?: string;
  categoryNameToIdMap?: Record<string, string>;
}

export interface ProviderImportBuildResult {
  document: ServiceProviderDocument;
  warnings: string[];
}
