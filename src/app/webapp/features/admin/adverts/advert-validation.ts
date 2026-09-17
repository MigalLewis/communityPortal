import { AdvertDocument } from '../../../../core/firebase/models/firestore-data.models';

export type AdvertInput = Omit<AdvertDocument, 'id' | 'createdAt' | 'updatedAt' | 'ownerAdminId' |
  'createdByAdminId' | 'updatedByAdminId' | 'activatedAt' | 'activatedByAdminId' |
  'deactivatedAt' | 'deactivatedByAdminId' | 'isPublic'>;

export function validateAdvert(input: AdvertInput, now = new Date()): string[] {
  const errors: string[] = [];
  if (!input.advertiserName.trim()) errors.push('Advertiser name is required.');
  if (!input.title.trim()) errors.push('Title is required.');
  if (!input.body.trim()) errors.push('Body is required.');
  if (!Number.isInteger(input.sortPriority) || input.sortPriority < 0) {
    errors.push('Sort priority must be a non-negative whole number.');
  }
  const start = Date.parse(input.startAt);
  const end = Date.parse(input.endAt);
  if (!Number.isFinite(start)) errors.push('A valid start date is required.');
  if (!Number.isFinite(end)) errors.push('A valid end date is required.');
  if (Number.isFinite(start) && Number.isFinite(end) && start >= end) {
    errors.push('End date must be after start date.');
  }
  if ((input.status === 'scheduled' || input.status === 'active') && Number.isFinite(end) && end < now.getTime()) {
    errors.push('The activation window has already expired.');
  }
  if (!['dashboard_hero', 'dashboard_sidebar', 'directory', 'sitewide_banner'].includes(input.placement)) {
    errors.push('Placement is not supported.');
  }
  if (input.media && (!isHttpUrl(input.media.url) || input.media.altText.trim().length < 3)) {
    errors.push('Media requires a valid URL and alternative text.');
  }
  if (input.link && (!isHttpUrl(input.link.url) || !input.link.label.trim())) {
    errors.push('Link requires a valid URL and label.');
  }
  return errors;
}

function isHttpUrl(value: string): boolean {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
