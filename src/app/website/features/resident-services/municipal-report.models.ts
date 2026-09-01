export const ISSUE_CATEGORIES = ['roads', 'water', 'electricity', 'waste', 'parks', 'stormwater', 'other'] as const;
export const MUNICIPAL_ENTITIES = ['Johannesburg Roads Agency', 'Johannesburg Water', 'City Power', 'Pikitup', 'Johannesburg City Parks', 'Other / unsure'] as const;
export const REPORT_STATUSES = ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'] as const;
export type IssueCategory = typeof ISSUE_CATEGORIES[number];
export type MunicipalEntity = typeof MUNICIPAL_ENTITIES[number];
export type ReportStatus = typeof REPORT_STATUSES[number];
export type ContactPreference = 'email' | 'phone' | 'none';

export interface ReportAttachment { name: string; contentType: string; size: number; storagePath?: string; }
export interface MunicipalReportDraft {
  category: IssueCategory | '';
  entity: MunicipalEntity | '';
  location: string;
  description: string;
  cityReference: string;
  contactPreference: ContactPreference;
  attachments: ReportAttachment[];
}
export interface MunicipalReport extends Omit<MunicipalReportDraft, 'category' | 'entity'> {
  id: string; referenceNumber: string; ownerId: string; category: IssueCategory;
  entity: MunicipalEntity; status: ReportStatus; assigneeId: string | null;
  resolutionNote?: string; createdAt: string; updatedAt: string;
}

export function validateMunicipalDraft(draft: MunicipalReportDraft): string[] {
  const errors: string[] = [];
  if (!ISSUE_CATEGORIES.includes(draft.category as IssueCategory)) errors.push('category');
  if (!MUNICIPAL_ENTITIES.includes(draft.entity as MunicipalEntity)) errors.push('entity');
  if (!draft.location.trim() || draft.location.length > 250) errors.push('location');
  if (draft.description.trim().length < 20 || draft.description.length > 4000) errors.push('description');
  if (!['email', 'phone', 'none'].includes(draft.contactPreference)) errors.push('contactPreference');
  if (draft.attachments.length > 5 || draft.attachments.some((file) => file.size < 1 || file.size > 5_000_000 || !['image/jpeg', 'image/png', 'application/pdf'].includes(file.contentType))) errors.push('attachments');
  return errors;
}

export function canTransitionReport(from: ReportStatus, to: ReportStatus): boolean {
  const transitions: Record<ReportStatus, ReportStatus[]> = {
    submitted: ['assigned', 'closed'], assigned: ['in_progress', 'closed'],
    in_progress: ['resolved', 'closed'], resolved: ['in_progress', 'closed'], closed: []
  };
  return transitions[from].includes(to);
}
