import {
  AvailabilityStatus,
  NormalizedProviderImportRow,
  ProviderImportBuildResult,
  ProviderImportContext,
  ProviderImportRawRow,
  ProviderImportRowResult,
  ProviderImportTransformContext,
  ProviderImportValidationResult
} from './provider-import.models';

const ALLOWED_AVAILABILITY: AvailabilityStatus[] = ['available_today', 'busy', 'unavailable'];

export function splitMultiValue(input: string): string[] {
  return input
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseBoolean(input: string): boolean | null {
  const value = input.trim().toLowerCase();

  if (!value) {
    return null;
  }

  if (['true', 'yes', '1'].includes(value)) {
    return true;
  }

  if (['false', 'no', '0'].includes(value)) {
    return false;
  }

  return null;
}

export function normalizeProviderImportRow(row: ProviderImportRawRow): NormalizedProviderImportRow {
  const read = (key: keyof ProviderImportRawRow['values']) => (row.values[key] ?? '').trim();

  return {
    rowNumber: row.rowNumber,
    fullName: read('fullName'),
    businessName: read('businessName'),
    email: read('email'),
    phone: read('phone'),
    alternatePhone: read('alternatePhone'),
    whatsappNumber: read('whatsappNumber'),
    area: read('area'),
    suburb: read('suburb'),
    address: read('address'),
    categoryNames: splitMultiValue(read('categories')),
    bio: read('bio'),
    tags: splitMultiValue(read('tags')),
    isVerified: parseBoolean(read('isVerified')),
    isFeatured: parseBoolean(read('isFeatured')),
    availabilityStatus: read('availabilityStatus').toLowerCase(),
    notes: read('notes'),
    website: read('website'),
    facebookUrl: read('facebookUrl'),
    instagramUrl: read('instagramUrl')
  };
}

export function validateProviderImportRows(
  rows: ProviderImportRawRow[],
  context: ProviderImportContext
): ProviderImportValidationResult {
  const duplicateKeys = new Set<string>();
  const duplicateEmailKeys = new Set<string>();

  const rowResults: ProviderImportRowResult[] = rows.map((source) => {
    const normalized = normalizeProviderImportRow(source);
    const errors: ProviderImportRowResult['errors'] = [];
    const warnings: ProviderImportRowResult['warnings'] = [];

    if (!normalized.fullName) {
      errors.push({ type: 'error', field: 'fullName', message: 'Full name is required.' });
    }

    if (!normalized.phone) {
      errors.push({ type: 'error', field: 'phone', message: 'Phone is required.' });
    }

    if (!normalized.area) {
      errors.push({ type: 'error', field: 'area', message: 'Area is required.' });
    }

    if (!normalized.categoryNames.length) {
      errors.push({ type: 'error', field: 'categories', message: 'At least one category is required.' });
    }

    if (normalized.email && !/^\S+@\S+\.\S+$/.test(normalized.email)) {
      errors.push({ type: 'error', field: 'email', message: 'Email format is invalid.' });
    }

    if (!ALLOWED_AVAILABILITY.includes(normalized.availabilityStatus as AvailabilityStatus)) {
      errors.push({ type: 'error', field: 'availabilityStatus', message: 'Availability status must be available_today, busy, or unavailable.' });
    }

    if ((source.values.isVerified ?? '').trim() && normalized.isVerified === null) {
      errors.push({ type: 'error', field: 'isVerified', message: 'isVerified must be true or false.' });
    }

    if ((source.values.isFeatured ?? '').trim() && normalized.isFeatured === null) {
      errors.push({ type: 'error', field: 'isFeatured', message: 'isFeatured must be true or false.' });
    }

    const unknownCategories = normalized.categoryNames.filter((name) => !context.knownCategoryMap[name.toLowerCase()]);
    if (unknownCategories.length) {
      warnings.push({ type: 'warning', field: 'categories', message: `Unknown categories: ${unknownCategories.join(', ')}` });
    }

    const duplicateKey = `${normalized.fullName.toLowerCase()}::${normalized.phone.toLowerCase()}`;
    if (normalized.fullName && normalized.phone) {
      if (duplicateKeys.has(duplicateKey)) {
        errors.push({ type: 'error', field: 'duplicate', message: 'Duplicate fullName + phone in uploaded file.' });
      }
      duplicateKeys.add(duplicateKey);
    }

    if (normalized.email) {
      const duplicateEmailKey = normalized.email.toLowerCase();
      if (duplicateEmailKeys.has(duplicateEmailKey)) {
        errors.push({ type: 'error', field: 'duplicate', message: 'Duplicate email in uploaded file.' });
      }
      duplicateEmailKeys.add(duplicateEmailKey);
    }

    if (context.existingDuplicateKeys?.has(duplicateKey)) {
      warnings.push({ type: 'warning', field: 'duplicate', message: 'Possible existing provider duplicate found (same fullName + phone).' });
    }

    if (normalized.email && context.existingEmailKeys?.has(normalized.email.toLowerCase())) {
      warnings.push({ type: 'warning', field: 'duplicate', message: 'Possible existing provider duplicate found (same email).' });
    }

    return {
      rowNumber: source.rowNumber,
      source,
      normalized,
      errors,
      warnings,
      isValid: errors.length === 0
    };
  });

  const summary = {
    totalRows: rowResults.length,
    validRows: rowResults.filter((row) => row.isValid).length,
    invalidRows: rowResults.filter((row) => !row.isValid).length,
    warningCount: rowResults.reduce((total, row) => total + row.warnings.length, 0),
    errorCount: rowResults.reduce((total, row) => total + row.errors.length, 0)
  };

  return { rows: rowResults, summary };
}

export function toServiceProviderDocument(
  row: NormalizedProviderImportRow,
  context: ProviderImportTransformContext
): ProviderImportBuildResult {
  const now = context.nowIso ?? new Date().toISOString();
  const warnings: string[] = [];

  const categoryIds = row.categoryNames
    .map((name) => {
      const id = context.categoryNameToIdMap?.[name.toLowerCase()];
      if (!id) {
        warnings.push(`Category '${name}' is unknown and was stored as a name only.`);
      }
      return id;
    })
    .filter((id): id is string => !!id);

  return {
    document: {
      id: crypto.randomUUID(),
      fullName: row.fullName,
      businessName: row.businessName,
      email: row.email,
      phone: row.phone,
      alternatePhone: row.alternatePhone || undefined,
      whatsappNumber: row.whatsappNumber || undefined,
      area: row.area,
      suburb: row.suburb || undefined,
      address: row.address || undefined,
      categoryIds,
      categoryNames: row.categoryNames,
      bio: row.bio,
      tags: row.tags,
      notes: row.notes || undefined,
      website: row.website || undefined,
      facebookUrl: row.facebookUrl || undefined,
      instagramUrl: row.instagramUrl || undefined,
      rating: 0,
      reviewCount: 0,
      isVerified: !!row.isVerified,
      isFeatured: !!row.isFeatured,
      availabilityStatus: row.availabilityStatus as AvailabilityStatus,
      profileImageUrl: '',
      galleryUrls: [],
      createdBy: context.adminUserId,
      createdAt: now,
      updatedAt: now
    },
    warnings
  };
}

export { ALLOWED_AVAILABILITY };
