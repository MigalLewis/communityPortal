import { RESOURCE_MAX_FILE_BYTES, validateResourceFile } from './resource-file.service';
describe('resource file policy', () => {
  it('accepts matching supported MIME types and extensions', () => expect(validateResourceFile({ name: 'guide.pdf', type: 'application/pdf', size: 100 })).toEqual([]));
  it('rejects disguised, empty, and oversized files', () => { expect(validateResourceFile({ name: 'guide.exe', type: 'application/pdf', size: 100 }).length).toBeGreaterThan(0); expect(validateResourceFile({ name: 'guide.pdf', type: 'application/pdf', size: RESOURCE_MAX_FILE_BYTES + 1 }).length).toBeGreaterThan(0); });
});
