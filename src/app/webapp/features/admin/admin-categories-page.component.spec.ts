import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryDocument } from '../../../core/firebase/models/firestore-data.models';
import { AdminCategoryService } from './admin-category.service';
import { AdminCategoriesPageComponent } from './admin-categories-page.component';

describe('AdminCategoriesPageComponent', () => {
  let fixture: ComponentFixture<AdminCategoriesPageComponent>;
  let service: jasmine.SpyObj<AdminCategoryService>;
  const record: CategoryDocument = { id: 'one', name: 'Cleaning', slug: 'cleaning', description: 'Home cleaning', icon: '🧹', isActive: true, createdAt: 'now', updatedAt: 'now' };

  beforeEach(async () => {
    service = jasmine.createSpyObj('AdminCategoryService', ['list', 'create', 'update', 'setActive', 'remove']);
    service.list.and.resolveTo([record]); service.create.and.resolveTo(record); service.update.and.resolveTo(record);
    await TestBed.configureTestingModule({ imports: [AdminCategoriesPageComponent], providers: [{ provide: AdminCategoryService, useValue: service }] }).compileComponents();
    fixture = TestBed.createComponent(AdminCategoriesPageComponent);
  });

  it('shows loading then loaded records', async () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading categories');
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Cleaning');
    expect(fixture.nativeElement.textContent).toContain('Home cleaning');
  });

  it('exposes required-name validation without submitting', async () => {
    fixture.detectChanges(); await fixture.whenStable();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit')); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#category-name-error').textContent).toContain('Enter a category name');
    expect(service.create).not.toHaveBeenCalled();
  });

  it('normalizes a slug and creates a category', async () => {
    fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.form.patchValue({ name: ' Café & Repairs ', slug: '' });
    await component.save();
    expect(service.create).toHaveBeenCalledWith(jasmine.objectContaining({ name: ' Café & Repairs ', slug: 'cafe-repairs' }));
  });

  it('updates the selected category', async () => {
    fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any;
    component.beginEdit(record); component.form.patchValue({ name: 'Cleaners' });
    await component.save();
    expect(service.update).toHaveBeenCalledWith(record, jasmine.objectContaining({ name: 'Cleaners', slug: 'cleaning' }));
  });

  it('shows failed loading requests as an alert', async () => {
    service.list.and.rejectWith(new Error('Categories unavailable'));
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Categories unavailable');
  });
});
