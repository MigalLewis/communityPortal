import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContractorRepository } from '../contractor-directory/services/contractor.repository';

@Component({ selector: 'app-contractor-profile-edit', standalone: true, imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contractor-profile-edit.component.html', styleUrl: './contractor-profile-page.component.scss' })
export class ContractorProfileEditComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly repository = inject(ContractorRepository);
  message = ''; saving = false;
  readonly form = this.fb.nonNullable.group({ businessName: ['', [Validators.required, Validators.maxLength(100)]], bio: ['', Validators.maxLength(1500)],
    services: ['', Validators.required], serviceAreas: ['', Validators.required], profileVisibility: ['public' as 'public'|'hidden', Validators.required],
    jobAvailability: ['unavailable' as 'available'|'unavailable', Validators.required], preferredMethod: ['platform' as 'email'|'phone'|'platform'],
    email: ['', Validators.email], phone: ['', Validators.maxLength(30)], website: ['', Validators.pattern(/^https?:\/\/.+/)], portfolioUrls: [''] });
  async ngOnInit(): Promise<void> { const c = await this.repository.getOwned(); if (!c) return;
    this.form.patchValue({ businessName: c.businessName, bio: c.bio ?? '', services: c.services.join(', '), serviceAreas: c.serviceAreas.join(', '),
      profileVisibility: c.profileVisibility, jobAvailability: c.jobAvailability, preferredMethod: c.contactPreferences.preferredMethod,
      email: c.contactPreferences.email ?? '', phone: c.contactPreferences.phone ?? '', website: c.contactPreferences.website ?? '', portfolioUrls: c.portfolioMedia.map(x => x.url).join('\n') }); }
  async save(): Promise<void> { if (this.form.invalid) { this.form.markAllAsTouched(); return; } this.saving = true; this.message = '';
    const v = this.form.getRawValue(); const list = (s: string) => [...new Set(s.split(',').map(x => x.trim()).filter(Boolean))].slice(0, 25);
    try { const current = await this.repository.getOwned(); if (!current) throw new Error('Profile unavailable.');
      await this.repository.updateOwnedProfile({ businessName: v.businessName.trim(), bio: v.bio.trim(), categoryIds: current.categoryIds,
        services: list(v.services), serviceAreas: list(v.serviceAreas), profileVisibility: v.profileVisibility, jobAvailability: v.jobAvailability,
        contactPreferences: { preferredMethod: v.preferredMethod, ...(v.email && { email: v.email }), ...(v.phone && { phone: v.phone }), ...(v.website && { website: v.website }) },
        portfolioMedia: v.portfolioUrls.split('\n').map(url => url.trim()).filter(Boolean).slice(0, 12).map(url => ({ url, caption: '', type: 'image' as const })) }); this.message = 'Profile saved.';
    } catch (e) { this.message = e instanceof Error ? e.message : 'Unable to save profile.'; } finally { this.saving = false; } }
}
