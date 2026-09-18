import { EventDocument } from '../../../../core/firebase/models/firestore-data.models';

export type EventInput = Pick<EventDocument, 'slug' | 'title' | 'summary' | 'description' | 'category' | 'venue' | 'startAt' | 'endAt' | 'image' | 'featured' | 'publicationMode' | 'visibleFrom' | 'visibleUntil'>;

export function validateEvent(input: EventInput): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())) errors.push('Slug must contain lowercase words separated by hyphens.');
  if (!input.title.trim()) errors.push('Title is required.');
  if (!input.summary.trim()) errors.push('Summary is required.');
  if (!input.description.trim()) errors.push('Description is required.');
  if (!input.category.trim()) errors.push('Category is required.');
  if (!input.venue.trim()) errors.push('Venue is required.');
  if (!input.startAt || !input.endAt || new Date(input.endAt).getTime() <= new Date(input.startAt).getTime()) errors.push('End time must be after the start time.');
  validateVisibility(input, errors);
  if (!input.image.url.trim()) errors.push('Image URL is required.');
  if (!input.image.altText.trim()) errors.push('Image alternative text is required.');
  return errors;
}

export function validateVisibility(input: Pick<EventInput, 'publicationMode' | 'visibleFrom' | 'visibleUntil'>, errors: string[]): void {
  if (input.publicationMode !== 'scheduled') return;
  const from = Date.parse(input.visibleFrom ?? ''); const until = Date.parse(input.visibleUntil ?? '');
  if (!Number.isFinite(from) || !Number.isFinite(until)) errors.push('Valid visibility start and end times are required for time based publication.');
  else if (until <= from) errors.push('Visibility end time must be after the visibility start time.');
}
