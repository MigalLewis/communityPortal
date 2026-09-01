import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ResourcesPageComponent } from './resources-page.component';

describe('ResourcesPageComponent', () => {
  let fixture: ComponentFixture<ResourcesPageComponent>;
  let component: ResourcesPageComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ResourcesPageComponent] }).compileComponents();
    fixture = TestBed.createComponent(ResourcesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('filters documents by search text and category', () => {
    const page = component as any;
    page.query = 'manual';
    expect(page.filteredDocuments.map((document: any) => document.id)).toEqual(['paia-manual-2025']);
    page.query = '';
    page.selectCategory('Forms');
    expect(page.filteredDocuments.map((document: any) => document.id)).toEqual(['membership-form-2026']);
  });

  it('uses quick links to reveal a document even when a category was selected', () => {
    const page = component as any;
    page.activeCategory = 'Pets';
    page.followQuickLink('paia-manual-2025');
    expect(page.activeCategory).toBe('');
    expect(page.filteredDocuments[0].id).toBe('paia-manual-2025');
  });

  it('renders maintained preview and download URLs', () => {
    const page = component as any;
    page.query = 'Membership Form';
    fixture.detectChanges();
    const preview = fixture.debugElement.query(By.css('.document-actions a[target="_blank"]')).nativeElement as HTMLAnchorElement;
    const download = fixture.debugElement.query(By.css('.document-actions a[download]')).nativeElement as HTMLAnchorElement;
    expect(preview.getAttribute('href')).toBe('/documents/pnra-membership-form-2026.pdf');
    expect(preview.getAttribute('rel')).toBe('noopener noreferrer');
    expect(download.getAttribute('href')).toBe('/documents/pnra-membership-form-2026.pdf');
    expect(download.getAttribute('download')).toBe('pnra-membership-form-2026.pdf');
  });

  it('falls back to a request action only when a document cannot be published', () => {
    const page = component as any;
    page.query = 'AGM Minutes';
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.document-actions a[download]'))).toBeNull();
    const request = fixture.debugElement.query(By.css('.document-actions .request')).nativeElement as HTMLAnchorElement;
    expect(request.getAttribute('href')).toContain('mailto:');
    expect(request.textContent).toContain('Request this document');
    expect(fixture.nativeElement.textContent).toContain('protected personal information');
  });

  it('provides document-specific accessible action labels', () => {
    const page = component as any;
    page.query = 'Membership Form';
    fixture.detectChanges();
    const labels = fixture.debugElement.queryAll(By.css('.document-actions a')).map((link) => link.nativeElement.getAttribute('aria-label'));
    expect(labels).toEqual([
      'Preview PNRA Membership Form 2026 in a new tab',
      'Download PNRA Membership Form 2026 as pnra-membership-form-2026.pdf'
    ]);
  });
});
