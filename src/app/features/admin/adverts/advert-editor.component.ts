import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdvertDocument, AdvertPlacement, AdvertStatus } from '../../../core/firebase/models/firestore-data.models';
import { AdvertAdminService } from './advert-admin.service';
import { AdvertInput } from './advert-validation';

@Component({ selector: 'app-advert-editor', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './advert-editor.component.html', styleUrl: './advert-editor.component.scss' })
export class AdvertEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly error = signal('');
  readonly saving = signal(false);
  existing: AdvertDocument | null = null;
  readonly form = this.fb.nonNullable.group({
    advertiserName: ['', [Validators.required, Validators.maxLength(120)]], title: ['', [Validators.required, Validators.maxLength(160)]],
    body: ['', [Validators.required, Validators.maxLength(1000)]], mediaUrl: [''], mediaType: ['image' as 'image' | 'video'], mediaAltText: [''],
    linkUrl: [''], linkLabel: [''], linkTarget: ['new_window' as 'same_window' | 'new_window'], placement: ['dashboard_hero' as AdvertPlacement, Validators.required],
    status: ['draft' as AdvertStatus, Validators.required], startAt: ['', Validators.required], endAt: ['', Validators.required], sortPriority: [0, [Validators.required, Validators.min(0)]]
  });
  constructor(private readonly service: AdvertAdminService, private readonly route: ActivatedRoute, private readonly router: Router) {}

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    try {
      this.existing = await this.service.get(id);
      if (!this.existing) throw new Error('Advert not found.');
      const a = this.existing;
      this.form.patchValue({ ...a, startAt: this.localDate(a.startAt), endAt: this.localDate(a.endAt), mediaUrl: a.media?.url ?? '', mediaType: a.media?.type ?? 'image', mediaAltText: a.media?.altText ?? '', linkUrl: a.link?.url ?? '', linkLabel: a.link?.label ?? '', linkTarget: a.link?.target ?? 'new_window' });
    } catch (error) { this.error.set(error instanceof Error ? error.message : 'Advert could not be loaded.'); }
  }

  async save(): Promise<void> {
    this.form.markAllAsTouched(); if (this.form.invalid) { this.error.set('Complete all required fields.'); return; }
    this.saving.set(true); this.error.set('');
    try { const input = this.toInput(); if (this.existing) await this.service.update(this.existing, input); else await this.service.create(input); await this.router.navigate(['/admin/adverts']); }
    catch (error) { this.error.set(error instanceof Error ? error.message : 'Advert could not be saved.'); }
    finally { this.saving.set(false); }
  }

  private toInput(): AdvertInput {
    const v = this.form.getRawValue();
    return { advertiserName:v.advertiserName.trim(), title:v.title.trim(), body:v.body.trim(), placement:v.placement, status:v.status,
      startAt:new Date(v.startAt).toISOString(), endAt:new Date(v.endAt).toISOString(), sortPriority:Number(v.sortPriority),
      ...(v.mediaUrl.trim() ? { media:{ url:v.mediaUrl.trim(), type:v.mediaType, altText:v.mediaAltText.trim() } } : {}),
      ...(v.linkUrl.trim() ? { link:{ url:v.linkUrl.trim(), label:v.linkLabel.trim(), target:v.linkTarget } } : {}) };
  }
  private localDate(value:string):string { const d=new Date(value); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16); }
}
