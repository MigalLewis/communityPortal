import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../webapp/features/auth/services/auth.service';
import { ISSUE_CATEGORIES, MUNICIPAL_ENTITIES, MunicipalReport, MunicipalReportDraft } from './municipal-report.models';
import { MunicipalReportService } from './municipal-report.service';

@Component({ selector: 'app-resident-services-page', standalone: true, imports: [CommonModule, ReactiveFormsModule, RouterLink], templateUrl: './resident-services-page.component.html', styleUrl: './resident-services-page.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ResidentServicesPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly categories = ISSUE_CATEGORIES; protected readonly entities = MUNICIPAL_ENTITIES;
  protected readonly reports = signal<MunicipalReport[]>([]); protected readonly error = signal('');
  protected readonly success = signal(''); protected readonly busy = signal(false); protected attachments: File[] = [];
  protected readonly form = this.fb.nonNullable.group({ category: ['', Validators.required], entity: ['', Validators.required], location: ['', [Validators.required, Validators.maxLength(250)]], description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(4000)]], cityReference: ['', Validators.maxLength(80)], contactPreference: ['email', Validators.required] });
  constructor(protected readonly auth: AuthService, private readonly service: MunicipalReportService, private readonly router: Router) { this.restoreDraft(); }
  async ngOnInit() { const user = this.auth.authUser(); if (user) try { this.reports.set(await this.service.list(user.idToken, user.id)); } catch (e) { this.error.set((e as Error).message); } }
  protected chooseFiles(event: Event) { this.error.set(''); const files = Array.from((event.target as HTMLInputElement).files ?? []); if (files.length > 5 || files.some(f => f.size > 5_000_000 || !['image/jpeg', 'image/png', 'application/pdf'].includes(f.type))) { this.error.set('Attach up to 5 JPG, PNG, or PDF files, no larger than 5 MB each.'); this.attachments = []; return; } this.attachments = files; }
  protected async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const draft = { ...this.form.getRawValue(), attachments: this.attachments.map(({ name, type: contentType, size }) => ({ name, contentType, size })) } as MunicipalReportDraft;
    const user = this.auth.authUser(); if (!user) { localStorage.setItem(this.service.draftKey, JSON.stringify(draft)); await this.router.navigate(['/login'], { queryParams: { redirectTo: '/resident-services' } }); return; }
    this.busy.set(true); this.error.set(''); try { const result = await this.service.submit(draft, user.idToken); localStorage.removeItem(this.service.draftKey); this.success.set(`Report submitted. Your reference is ${result.referenceNumber}.`); this.form.reset({ contactPreference: 'email' }); this.attachments = []; this.reports.set(await this.service.list(user.idToken, user.id)); } catch (e) { this.error.set((e as Error).message || 'Submission failed. Your draft has been kept.'); localStorage.setItem(this.service.draftKey, JSON.stringify(draft)); } finally { this.busy.set(false); }
  }
  private restoreDraft() { const raw = localStorage.getItem(this.service.draftKey); if (raw) try { const draft = JSON.parse(raw); this.form.patchValue(draft); } catch { localStorage.removeItem(this.service.draftKey); } }
}
