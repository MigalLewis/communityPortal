import {
  normalizeProviderImportRow,
  parseBoolean,
  splitMultiValue,
  toServiceProviderDocument,
  validateProviderImportRows
} from './provider-import.util';
import { ProviderImportRawRow } from './provider-import.models';

describe('provider-import util', () => {
  it('splits comma separated categories/tags', () => {
    expect(splitMultiValue('Electrician, Appliance Repair,  ')).toEqual(['Electrician', 'Appliance Repair']);
  });

  it('parses booleans from multiple formats', () => {
    expect(parseBoolean('true')).toBeTrue();
    expect(parseBoolean('0')).toBeFalse();
    expect(parseBoolean('invalid')).toBeNull();
  });

  it('normalizes and validates a provider import row', () => {
    const rows: ProviderImportRawRow[] = [
      {
        rowNumber: 2,
        values: {
          fullName: 'Jane Doe',
          phone: '0123',
          area: 'North',
          categories: 'Electrician',
          availabilityStatus: 'available_today',
          isVerified: 'true',
          isFeatured: 'false',
          email: 'jane@example.com'
        }
      }
    ];

    const result = validateProviderImportRows(rows, { knownCategoryMap: { electrician: 'cat-1' } });

    expect(result.summary.validRows).toBe(1);
    expect(result.rows[0].normalized.categoryNames).toEqual(['Electrician']);
  });

  it('rejects invalid availability status and malformed email', () => {
    const rows: ProviderImportRawRow[] = [
      {
        rowNumber: 2,
        values: {
          fullName: 'Bad Row',
          phone: '0123',
          area: 'North',
          categories: 'Electrician',
          availabilityStatus: 'anytime',
          isVerified: 'true',
          isFeatured: 'false',
          email: 'broken-email'
        }
      }
    ];

    const result = validateProviderImportRows(rows, { knownCategoryMap: { electrician: 'cat-1' } });

    expect(result.summary.invalidRows).toBe(1);
    expect(result.rows[0].errors.some((error) => error.field === 'availabilityStatus')).toBeTrue();
    expect(result.rows[0].errors.some((error) => error.field === 'email')).toBeTrue();
  });

  it('transforms row into service provider document defaults', () => {
    const normalized = normalizeProviderImportRow({
      rowNumber: 2,
      values: {
        fullName: 'Jane Doe',
        businessName: 'JD Plumbing',
        phone: '0123',
        area: 'North',
        categories: 'Plumber',
        availabilityStatus: 'busy',
        isVerified: 'true',
        isFeatured: 'false',
        tags: 'trusted,fast'
      }
    });

    const { document } = toServiceProviderDocument(normalized, {
      adminUserId: 'admin-1',
      nowIso: '2026-01-01T00:00:00.000Z',
      categoryNameToIdMap: { plumber: 'cat-1' }
    });

    expect(document.rating).toBe(0);
    expect(document.reviewCount).toBe(0);
    expect(document.galleryUrls).toEqual([]);
    expect(document.categoryIds).toEqual(['cat-1']);
    expect(document.tags).toEqual(['trusted', 'fast']);
    expect(document.createdBy).toBe('admin-1');
  });
});
