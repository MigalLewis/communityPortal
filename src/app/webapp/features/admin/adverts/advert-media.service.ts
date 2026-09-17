import { Injectable } from '@angular/core';
import { firebaseConfig } from '../../../../../environments/firebase.config';

const MAX_MEDIA_BYTES = 5_000_000;
const MEDIA_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

/** Uploads advert images to the administrator-only Storage area. */
@Injectable({ providedIn: 'root' })
export class AdvertMediaService {
  async upload(file: File, idToken: string): Promise<string> {
    if (!MEDIA_TYPES.has(file.type)) throw new Error('Choose a JPG, PNG, WebP, or GIF image.');
    if (!file.size || file.size > MAX_MEDIA_BYTES) throw new Error('Advert images must be 5 MB or smaller.');
    if (!firebaseConfig.storageBucket) throw new Error('Media storage is not configured.');

    const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'image';
    const objectName = `adverts/${crypto.randomUUID()}.${extension}`;
    const endpoint = `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseConfig.storageBucket)}/o?uploadType=media&name=${encodeURIComponent(objectName)}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': file.type },
      body: file
    });
    if (!response.ok) throw new Error('The advert image could not be uploaded.');
    const uploaded = await response.json() as { name: string; downloadTokens?: string };
    if (!uploaded.downloadTokens) throw new Error('The uploaded image is not available for public delivery.');
    return `https://firebasestorage.googleapis.com/v0/b/${encodeURIComponent(firebaseConfig.storageBucket)}/o/${encodeURIComponent(uploaded.name)}?alt=media&token=${encodeURIComponent(uploaded.downloadTokens)}`;
  }
}
