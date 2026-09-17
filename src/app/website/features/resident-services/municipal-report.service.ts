import { Injectable } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';
import { FirebaseFunctionsService } from '../../../core/firebase/services/firebase-functions.service';
import { FirestoreDocumentResponse, fromFirestoreDocument } from '../../../core/firebase/services/firestore-serializer';
import { MunicipalReport, MunicipalReportAssignee, MunicipalReportDraft, MunicipalReportPage, ReportStatus } from './municipal-report.models';

@Injectable({ providedIn: 'root' })
export class MunicipalReportService {
  readonly draftKey = 'pnra-municipal-report-draft';
  readonly pageSize = 20;
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
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'municipalReports' }], ...(where ? { where } : {}), orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }], limit: this.pageSize } })
    });
    if (!response.ok) throw new Error('Unable to load reports. Please retry.');
    const rows = await response.json() as { document?: FirestoreDocumentResponse }[];
    return rows.flatMap(({ document }) => document ? [fromFirestoreDocument<MunicipalReport>(document)!] : []);
  }


  async listPage(token: string, page = 0): Promise<MunicipalReportPage> {
    const response = await this.runQuery('municipalReports', token, {
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      offset: Math.max(0, page) * this.pageSize, limit: this.pageSize + 1
    });
    const reports = response.slice(0, this.pageSize).map((document) => fromFirestoreDocument<MunicipalReport>(document)!);
    return { reports, page: Math.max(0, page), hasNextPage: response.length > this.pageSize };
  }

  async listAssignees(token: string): Promise<MunicipalReportAssignee[]> {
    const response = await this.runQuery('users', token, {
      where: { compositeFilter: { op: 'AND', filters: [
        { fieldFilter: { field: { fieldPath: 'status' }, op: 'EQUAL', value: { stringValue: 'active' } } },
        { fieldFilter: { field: { fieldPath: 'role' }, op: 'IN', value: { arrayValue: { values: [{ stringValue: 'admin' }, { stringValue: 'super_admin' }] } } } }
      ] } }, orderBy: [{ field: { fieldPath: 'fullName' }, direction: 'ASCENDING' }], limit: 100
    });
    return response.map((document) => fromFirestoreDocument<MunicipalReportAssignee>(document)!);
  }

  private async runQuery(collectionId: string, token: string, structuredQuery: object): Promise<FirestoreDocumentResponse[]> {
    const response = await fetch(`${firebaseClient.firestoreBaseUrl}:runQuery?key=${firebaseClient.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ structuredQuery: { from: [{ collectionId }], ...structuredQuery } })
    });
    if (!response.ok) throw new Error('Unable to load reports. Please retry.');
    const rows = await response.json() as { document?: FirestoreDocumentResponse }[];
    return rows.flatMap(({ document }) => document ? [document] : []);
  }
}
