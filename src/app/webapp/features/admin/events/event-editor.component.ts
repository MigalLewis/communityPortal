import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EventDocument } from '../../../../core/firebase/models/firestore-data.models';
import { EventAdminService } from './event-admin.service';

@Component({ selector: 'app-event-editor', standalone: true, imports: [ReactiveFormsModule, RouterLink], templateUrl: './event-editor.component.html', styleUrl: './event-editor.component.scss' })
export class EventEditorComponent implements OnInit {
  readonly loading = signal(false); readonly saving = signal(false); readonly error = signal(''); private existing?: EventDocument;
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({ slug:['',[Validators.required,Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]], title:['',Validators.required], summary:['',Validators.required], description:['',Validators.required], category:['',Validators.required], venue:['',Validators.required], startAt:['',Validators.required], endAt:['',Validators.required], imageUrl:['',Validators.required], imageAlt:['',Validators.required], imageCaption:[''], featured:[false] });
  constructor(private readonly route: ActivatedRoute, private readonly router: Router, private readonly admin: EventAdminService) {}
  async ngOnInit(): Promise<void> { const id=this.route.snapshot.paramMap.get('id'); if(!id)return; this.loading.set(true); try { const event=await this.admin.get(id); if(!event) throw new Error('Event not found.'); this.existing=event; this.form.patchValue({...event,startAt:this.local(event.startAt),endAt:this.local(event.endAt),imageUrl:event.image.url,imageAlt:event.image.altText,imageCaption:event.image.caption??''}); } catch(e){this.error.set(e instanceof Error?e.message:'Event could not be loaded.');} finally{this.loading.set(false);} }
  async save(): Promise<void> { this.form.markAllAsTouched(); if(this.form.invalid){this.error.set('Complete all required fields.');return;} this.saving.set(true); this.error.set(''); const v=this.form.getRawValue(); try { await this.admin.save({slug:v.slug.trim(),title:v.title.trim(),summary:v.summary.trim(),description:v.description.trim(),category:v.category.trim(),venue:v.venue.trim(),startAt:new Date(v.startAt).toISOString(),endAt:new Date(v.endAt).toISOString(),image:{url:v.imageUrl.trim(),altText:v.imageAlt.trim(),...(v.imageCaption.trim()?{caption:v.imageCaption.trim()}: {})},featured:v.featured},this.existing); await this.router.navigateByUrl('/admin/events'); } catch(e){this.error.set(e instanceof Error?e.message:'Event could not be saved.');} finally{this.saving.set(false);} }
  private local(value:string):string{return new Date(value).toISOString().slice(0,16);}
}
