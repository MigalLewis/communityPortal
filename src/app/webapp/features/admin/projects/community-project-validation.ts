import { CommunityProjectDocument } from '../../../../core/firebase/models/firestore-data.models';

export type CommunityProjectInput = Pick<CommunityProjectDocument,
  'slug' | 'title' | 'summary' | 'content' | 'category' | 'status' | 'image' | 'progress' | 'featured' | 'startDate' | 'completionDate'>;

export function validateCommunityProject(input: CommunityProjectInput): string[] {
  const errors: string[] = [];
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.slug.trim())) errors.push('Slug must contain lowercase words separated by hyphens.');
  if (!input.title.trim()) errors.push('Title is required.');
  if (!input.summary.trim()) errors.push('Summary is required.');
  if (!input.content.trim()) errors.push('Full content is required.');
  if (!input.category.trim()) errors.push('Category is required.');
  if (!Number.isInteger(input.progress) || input.progress < 0 || input.progress > 100) errors.push('Progress must be a whole number from 0 to 100.');
  if (!input.image.url.trim()) errors.push('Image URL is required.');
  if (!input.image.altText.trim()) errors.push('Image alternative text is required.');
  if (input.startDate && input.completionDate && input.completionDate < input.startDate) errors.push('Completion date cannot be before the start date.');
  return errors;
}
