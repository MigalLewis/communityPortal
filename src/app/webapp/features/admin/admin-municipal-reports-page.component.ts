import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';
import { MunicipalReport, REPORT_STATUSES, ReportStatus } from '../../../website/features/resident-services/municipal-report.models';
import { MunicipalReportService } from '../../../website/features/resident-services/municipal-report.service';

@Component({ selector: 'app-admin-municipal-reports-page', standalone: true, imports: [CommonModule, FormsModule], template: `
  <section class="page"><header><div><p>PNRA administration</p><h1>Municipal reports</h1></div><button (click)="load()">Refresh</button></header>
  <p class="error" *ngIf="error()">{{ error() }}</p><p *ngIf="loading()">Loading reports…</p>
  <article *ngFor="let report of reports()"><div><strong>{{ report.referenceNumber }}</strong><h2>{{ report.category | titlecase }} — {{ report.location }}</h2><p>{{ report.description }}</p><small>{{ report.entity }} · City ref: {{ report.cityReference || 'none' }}</small></div>
    <div class="workflow"><label>Status<select [(ngModel)]="report.status"><option *ngFor="let status of statuses" [value]="status">{{ status | titlecase }}</option></select></label><label>Assign to<input [(ngModel)]="report.assigneeId" placeholder="Administrator ID"></label><label>Update / closing note<textarea [(ngModel)]="report.resolutionNote" rows="3"></textarea></label><button (click)="save(report)">Save update</button></div></article>
  </section>`, styles: [`:host{display:block}.page{padding:32px;max-width:1100px;margin:auto}header,article{display:flex;justify-content:space-between;gap:32px}header{align-items:center}article{background:#fff;border:1px solid #ddd;border-radius:10px;margin:20px 0;padding:24px}article>div:first-child{flex:1}.workflow{width:300px}label{display:block;margin-bottom:12px;font-weight:600}input,select,textarea{box-sizing:border-box;width:100%;padding:8px;margin-top:4px}.error{color:#a32616}@media(max-width:700px){header,article{display:block}.workflow{width:auto}}`]
})
export class AdminMunicipalReportsPageComponent implements OnInit {
  protected readonly statuses = REPORT_STATUSES; protected readonly reports = signal<MunicipalReport[]>([]); protected readonly error = signal(''); protected readonly loading = signal(false);
  constructor(private readonly service: MunicipalReportService, private readonly auth: AuthService) {}
  ngOnInit() { void this.load(); }
  protected async load() { const user = this.auth.authUser(); if (!user) return; this.loading.set(true); this.error.set(''); try { this.reports.set(await this.service.list(user.idToken)); } catch(e) { this.error.set((e as Error).message); } finally { this.loading.set(false); } }
  protected async save(report: MunicipalReport) { const user = this.auth.authUser(); if (!user) return; this.error.set(''); try { await this.service.update(report.id, report.status as ReportStatus, report.assigneeId || '', report.resolutionNote || '', user.idToken); await this.load(); } catch(e) { this.error.set((e as Error).message); } }
}
