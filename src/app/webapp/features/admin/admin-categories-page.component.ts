import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryDocument } from '../../../core/firebase/models/firestore-data.models';
import { AdminCategoryService, normalizeCategorySlug } from './admin-category.service';

@Component({
  selector: 'app-admin-categories-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-categories-page.component.html',
  styleUrl: './admin-categories-page.component.scss'
})
export class AdminCategoriesPageComponent implements OnInit {
  protected readonly categories = signal<CategoryDocument[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly editing = signal<CategoryDocument | null>(null);
  protected readonly form;

  constructor(private readonly fb: FormBuilder, private readonly categoryService: AdminCategoryService) {
    this.form = this.fb.nonNullable.group({
      name: ['', Validators.required],
      slug: [''],
      description: [''],
      icon: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void { void this.load(); }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set('');
    try { this.categories.set(await this.categoryService.list()); }
    catch (error) { this.error.set(this.message(error, 'Unable to load categories.')); }
    finally { this.loading.set(false); }
  }

  protected beginCreate(): void {
    this.editing.set(null);
    this.form.reset({ name: '', slug: '', description: '', icon: '', isActive: true });
    this.notice.set(''); this.error.set('');
  }

  protected beginEdit(category: CategoryDocument): void {
    this.editing.set(category);
    this.form.reset({ name: category.name, slug: category.slug, description: category.description ?? '', icon: category.icon ?? '', isActive: category.isActive });
    this.notice.set(''); this.error.set('');
  }

  protected normalizedSlug(): string {
    const value = this.form.getRawValue();
    return normalizeCategorySlug(value.slug || value.name);
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = { ...this.form.getRawValue(), slug: this.normalizedSlug() };
    const duplicate = this.categories().some((item) => item.id !== this.editing()?.id && item.slug === value.slug);
    if (!value.slug) { this.form.controls.slug.setErrors({ invalidSlug: true }); return; }
    if (duplicate) { this.form.controls.slug.setErrors({ duplicate: true }); return; }
    this.saving.set(true); this.error.set(''); this.notice.set('');
    try {
      const wasEditing = !!this.editing();
      if (wasEditing) await this.categoryService.update(this.editing()!, value);
      else await this.categoryService.create(value);
      this.beginCreate();
      this.notice.set(`${value.name} ${wasEditing ? 'updated' : 'saved'}.`);
      await this.load();
    } catch (error) { this.error.set(this.message(error, 'Unable to save category.')); }
    finally { this.saving.set(false); }
  }

  protected async toggle(category: CategoryDocument): Promise<void> {
    await this.perform(async () => { await this.categoryService.setActive(category, !category.isActive); }, `${category.name} ${category.isActive ? 'deactivated' : 'activated'}.`);
  }

  protected async remove(category: CategoryDocument): Promise<void> {
    if (!confirm(`Permanently delete “${category.name}”? This cannot be undone.`)) return;
    await this.perform(() => this.categoryService.remove(category), `${category.name} deleted.`);
  }

  private async perform(action: () => Promise<unknown>, success: string): Promise<void> {
    this.saving.set(true); this.error.set(''); this.notice.set('');
    try { await action(); this.notice.set(success); await this.load(); }
    catch (error) { this.error.set(this.message(error, 'The request failed.')); }
    finally { this.saving.set(false); }
  }

  private message(error: unknown, fallback: string): string { return error instanceof Error ? error.message : fallback; }
}
