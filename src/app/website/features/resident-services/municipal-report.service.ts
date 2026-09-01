import { Injectable } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';
import { FirebaseFunctionsService } from '../../../core/firebase/services/firebase-functions.service';
import { FirestoreDocumentResponse, fromFirestoreDocument } from '../../../core/firebase/services/firestore-serializer';
import { MunicipalReport, MunicipalReportDraft, ReportStatus } from './municipal-report.models';

@Injectable({ providedIn: 'root' })
export class MunicipalReportService {
  readonly draftKey = 'pnra-municipal-report-draft';
  constructor(private readonly functions: FirebaseFunctionsService) {}

  submit(draft: MunicipalReportDraft, token: string): Promise<{ referenceNumber: string; reportId: string }> {
    return this.functions.call('submitMunicipalReport', draft, token);
  }
  update(reportId: string, status: ReportStatus, assigneeId: string, resolutionNote: string, token: string): Promise<void> {
    return this.functions.call('manageMunicipalReport', { reportId, status, assigneeId, resolutionNote }, token);
  }
  async list(token: string, ownerId?: string): Promise<MunicipalReport[]> {
    const where = ownerId ? { fieldFilter: { field: { fieldPath: 'ownerId' }, op: 'EQUAL', value: { stringValue: ownerId } } } : undefined;
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'municipalReports' }], ...(where ? { where } : {}), orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }] } })
    });
    if (!response.ok) throw new Error('Unable to load reports. Please retry.');
    const rows = await response.json() as { document?: FirestoreDocumentResponse }[];
    return rows.flatMap(({ document }) => document ? [fromFirestoreDocument<MunicipalReport>(document)!] : []);
  }
}
