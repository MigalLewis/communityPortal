import { Injectable } from '@angular/core';
import { ResourceFileMetadata } from '../../../../core/firebase/models/firestore-data.models';
import { firebaseConfig } from '../../../../../environments/firebase.config';

export const RESOURCE_MAX_FILE_BYTES = 15 * 1024 * 1024;
const TYPES: Record<string, string[]> = {
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
  'application/vnd.ms-excel': ['xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
  'text/csv': ['csv']
};

export function validateResourceFile(file: Pick<File, 'name' | 'type' | 'size'>): string[] {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const errors: string[] = [];
  if (!TYPES[file.type]?.includes(extension)) errors.push('The file type and extension must be PDF, Word, Excel, or CSV.');
  if (!file.size || file.size > RESOURCE_MAX_FILE_BYTES) errors.push('Resource files must be non-empty and no larger than 15 MB.');
  return errors;
}

@Injectable({ providedIn: 'root' })
export class ResourceFileService {
  async upload(file: File, token: string): Promise<ResourceFileMetadata> {
    const errors = validateResourceFile(file); if (errors.length) throw new Error(errors.join(' '));
    if (!firebaseConfig.storageBucket) throw new Error('Resource storage is not configured.');
    const extension = file.name.split('.').pop()!.toLowerCase();
    const storagePath = `resources/${crypto.randomUUID()}.${extension}`;
    const endpoint = `${this.baseUrl()}?uploadType=media&name=${encodeURIComponent(storagePath)}`;
    const response = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': file.type }, body: file });
    if (!response.ok) throw new Error('The resource file could not be uploaded.');
    const result = await response.json() as { name: string; downloadTokens?: string };
    if (!result.downloadTokens) throw new Error('The uploaded resource is not available for delivery.');
    const downloadUrl = `${this.baseUrl()}/${encodeURIComponent(result.name)}?alt=media&token=${encodeURIComponent(result.downloadTokens)}`;
    return { storagePath, fileName: file.name, mimeType: file.type, extension, sizeBytes: file.size, downloadUrl,
      ...(file.type === 'application/pdf' ? { previewUrl: downloadUrl } : {}) };
  }

  async remove(storagePath: string, token: string): Promise<void> {
    if (!storagePath.startsWith('resources/')) throw new Error('Invalid resource storage path.');
    const response = await fetch(`${this.baseUrl()}/${encodeURIComponent(storagePath)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok && response.status !== 404) throw new Error('The old resource file could not be deleted.');
  }
  private baseUrl(): string { return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseConfig.storageBucket)}/o`; }
}
