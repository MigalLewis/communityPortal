import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import {
  ISSUE_CATEGORIES, MunicipalReport, MunicipalReportAssignee, MunicipalReportEdit,
  REPORT_STATUSES, ReportStatus, canTransitionReport, validateMunicipalReportEdit
} from '../../../website/features/resident-services/municipal-report.models';
import { MunicipalReportService } from '../../../website/features/resident-services/municipal-report.service';

@Component({ selector: 'app-admin-municipal-reports-page', standalone: true, imports: [CommonModule, FormsModule], template: `
  <section class="page">
    <header><div><p>PNRA administration</p><h1>Municipal reports</h1></div><button (click)="load(page())" [disabled]="loading()">Refresh</button></header>
    <div class="filters" aria-label="Report filters">
      <label>Status<select [(ngModel)]="statusFilter"><option value="">All statuses</option><option *ngFor="let status of statuses" [value]="status">{{ status | titlecase }}</option></select></label>
      <label>Category<select [(ngModel)]="categoryFilter"><option value="">All categories</option><option *ngFor="let category of categories" [value]="category">{{ category | titlecase }}</option></select></label>
      <label>Assignee<select [(ngModel)]="assigneeFilter"><option value="">All assignees</option><option value="unassigned">Unassigned</option><option *ngFor="let person of assignees()" [value]="person.id">{{ person.fullName }}</option></select></label>
      <label>Search<input [(ngModel)]="textFilter" placeholder="Reference, location or description"></label>
    </div>
    <p class="error" role="alert" *ngIf="error()">{{ error() }}</p>
    <p *ngIf="loading()">Loading reports…</p>
    <p class="empty" *ngIf="!loading() && !error() && reports().length === 0">No municipal reports have been submitted.</p>
    <p class="empty" *ngIf="!loading() && reports().length > 0 && filteredReports().length === 0">No reports match these filters.</p>
    <article *ngFor="let report of filteredReports(); trackBy: trackReport">
      <div><strong>{{ report.referenceNumber }}</strong><h2>{{ report.category | titlecase }} — {{ report.location }}</h2><p>{{ report.description }}</p><small>{{ report.entity }} · City ref: {{ report.cityReference || 'none' }}</small></div>
      <div class="workflow">
        <label>Status<select [(ngModel)]="edits[report.id].status"><option *ngFor="let status of availableStatuses(report)" [value]="status">{{ status | titlecase }}</option></select></label>
        <label>Assign to<select [(ngModel)]="edits[report.id].assigneeId"><option value="">Unassigned</option><option *ngFor="let person of assignees()" [value]="person.id">{{ person.fullName }} ({{ person.email }})</option></select></label>
        <label>Update / resolution note<textarea [(ngModel)]="edits[report.id].resolutionNote" rows="3"></textarea></label>
        <p class="error" role="alert" *ngIf="validation[report.id]">{{ validation[report.id] }}</p>
        <p class="success" role="status" *ngIf="feedback[report.id]">{{ feedback[report.id] }}</p>
        <button (click)="save(report)" [disabled]="saving().has(report.id)">{{ saving().has(report.id) ? 'Saving…' : 'Save update' }}</button>
      </div>
    </article>
    <nav *ngIf="!loading() && reports().length"><button (click)="load(page() - 1)" [disabled]="page() === 0">Previous</button><span>Page {{ page() + 1 }}</span><button (click)="load(page() + 1)" [disabled]="!hasNextPage()">Next</button></nav>
  </section>`, styles: [`:host{display:block}.page{padding:32px;max-width:1100px;margin:auto}header,article{display:flex;justify-content:space-between;gap:32px}header{align-items:center}.filters{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;background:#f5f6f7;padding:16px;border-radius:10px}article{background:#fff;border:1px solid #ddd;border-radius:10px;margin:20px 0;padding:24px}article>div:first-child{flex:1}.workflow{width:320px}label{display:block;margin-bottom:12px;font-weight:600}input,select,textarea{box-sizing:border-box;width:100%;padding:8px;margin-top:4px}.error{color:#a32616}.success{color:#28713d}.empty{text-align:center;padding:36px;background:#fff;border:1px dashed #aaa}nav{display:flex;justify-content:center;align-items:center;gap:16px}@media(max-width:700px){header,article{display:block}.workflow{width:auto}.filters{grid-template-columns:1fr}}`]
})
export class AdminMunicipalReportsPageComponent implements OnInit {
  protected readonly statuses = REPORT_STATUSES; protected readonly categories = ISSUE_CATEGORIES;
  protected readonly reports = signal<MunicipalReport[]>([]); protected readonly assignees = signal<MunicipalReportAssignee[]>([]);
  protected readonly error = signal(''); protected readonly loading = signal(false); protected readonly saving = signal(new Set<string>());
  protected readonly page = signal(0); protected readonly hasNextPage = signal(false);
  protected statusFilter = ''; protected categoryFilter = ''; protected assigneeFilter = ''; protected textFilter = '';
  protected edits: Record<string, MunicipalReportEdit> = {}; protected validation: Record<string, string> = {}; protected feedback: Record<string, string> = {};
  protected filteredReports(): MunicipalReport[] { return this.reports().filter((report) => {
    const query = this.textFilter.trim().toLocaleLowerCase();
    return (!this.statusFilter || report.status === this.statusFilter)
      && (!this.categoryFilter || report.category === this.categoryFilter)
      && (!this.assigneeFilter || (this.assigneeFilter === 'unassigned' ? !report.assigneeId : report.assigneeId === this.assigneeFilter))
      && (!query || [report.referenceNumber, report.location, report.description, report.cityReference].some((value) => value?.toLocaleLowerCase().includes(query)));
  }); }

  constructor(private readonly service: MunicipalReportService, private readonly auth: AuthService) {}
  ngOnInit() { void this.load(0); }
  protected trackReport(_index: number, report: MunicipalReport) { return report.id; }
  protected availableStatuses(report: MunicipalReport): ReportStatus[] { return REPORT_STATUSES.filter((status) => status === report.status || canTransitionReport(report.status, status)); }
  protected async load(page: number) {
    const user = this.auth.authUser(); if (!user) return;
    this.loading.set(true); this.error.set('');
    try {
      const [result, assignees] = await Promise.all([this.service.listPage(user.idToken, Math.max(0, page)), this.service.listAssignees(user.idToken)]);
      this.reports.set(result.reports); this.page.set(result.page); this.hasNextPage.set(result.hasNextPage); this.assignees.set(assignees);
      this.edits = Object.fromEntries(result.reports.map((report) => [report.id, { status: report.status, assigneeId: report.assigneeId || '', resolutionNote: report.resolutionNote || '' }]));
    } catch (e) { this.error.set((e as Error).message); } finally { this.loading.set(false); }
  }
  protected async save(report: MunicipalReport) {
    const user = this.auth.authUser(); const edit = this.edits[report.id]; if (!user || !edit || this.saving().has(report.id)) return;
    const errors = validateMunicipalReportEdit(report, edit);
    if (errors.length) {
      this.validation[report.id] = errors.includes('status') ? 'That status transition is not allowed.' : errors.includes('assigneeId') ? 'Select an assignee for this status.' : 'Enter a resolution note before closing the report.';
      return;
    }
    this.validation[report.id] = ''; this.feedback[report.id] = ''; this.saving.update((ids) => new Set(ids).add(report.id));
    try {
      await this.service.update(report.id, edit.status, edit.assigneeId, edit.resolutionNote, user.idToken);
      this.reports.update((reports) => reports.map((item) => item.id === report.id ? { ...item, ...edit, assigneeId: edit.assigneeId || null } : item));
      this.feedback[report.id] = 'Report updated successfully.';
    } catch (e) { this.validation[report.id] = (e as Error).message || 'The report could not be updated.'; }
    finally { this.saving.update((ids) => { const next = new Set(ids); next.delete(report.id); return next; }); }
  }
}
