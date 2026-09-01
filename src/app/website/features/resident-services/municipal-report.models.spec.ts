import { canTransitionReport, MunicipalReportDraft, validateMunicipalDraft } from './municipal-report.models';

describe('municipal report validation', () => {
  const valid = (): MunicipalReportDraft => ({ category: 'roads', entity: 'Johannesburg Roads Agency', location: '12 Example Street', description: 'A large pothole has blocked the southbound lane.', cityReference: '800123', contactPreference: 'email', attachments: [] });
  it('accepts a complete report', () => expect(validateMunicipalDraft(valid())).toEqual([]));
  it('rejects invalid required fields', () => expect(validateMunicipalDraft({ ...valid(), category: '', location: '', description: 'short' })).toEqual(jasmine.arrayContaining(['category', 'location', 'description'])));
  it('rejects unsafe attachment types and sizes', () => expect(validateMunicipalDraft({ ...valid(), attachments: [{ name: 'payload.exe', contentType: 'application/x-msdownload', size: 5_000_001 }] })).toContain('attachments'));
  it('permits no more than five safe evidence files', () => expect(validateMunicipalDraft({ ...valid(), attachments: Array.from({ length: 6 }, (_, i) => ({ name: `${i}.png`, contentType: 'image/png', size: 50 })) })).toContain('attachments'));
});

describe('municipal report status workflow', () => {
  it('supports assignment, progress, resolution, and closure', () => {
    expect(canTransitionReport('submitted', 'assigned')).toBeTrue();
    expect(canTransitionReport('assigned', 'in_progress')).toBeTrue();
    expect(canTransitionReport('in_progress', 'resolved')).toBeTrue();
    expect(canTransitionReport('resolved', 'closed')).toBeTrue();
  });
  it('does not reopen a closed report or skip directly to resolved', () => {
    expect(canTransitionReport('closed', 'in_progress')).toBeFalse();
    expect(canTransitionReport('submitted', 'resolved')).toBeFalse();
  });
});
