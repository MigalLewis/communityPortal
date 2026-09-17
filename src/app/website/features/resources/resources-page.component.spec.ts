import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ResourceDocument } from '../../../core/firebase/models/firestore-data.models';
import { PublicResourceRepository } from './public-resource.repository';
import { ResourcesPageComponent } from './resources-page.component';

const resources: ResourceDocument[] = [
  { id: 'form', title: 'Membership Form', slug: 'membership-form', categoryId: 'forms', description: 'Join PNRA', publicationDate: '2026-08-01', publicationState: 'published', accessMode: 'download', featured: false, quickLink: true, createdAt: '', updatedAt: '', file: { storagePath: 'resources/form.pdf', fileName: 'form.pdf', mimeType: 'application/pdf', extension: 'pdf', sizeBytes: 2048, downloadUrl: '/form.pdf', previewUrl: '/form.pdf' } },
  { id: 'minutes', title: 'AGM Minutes', slug: 'minutes', categoryId: 'governance', description: 'Official minutes', publicationDate: '2026-03-01', publicationState: 'published', accessMode: 'request', requestReason: 'Personal information requires review.', featured: false, quickLink: false, createdAt: '', updatedAt: '' }
];
describe('ResourcesPageComponent', () => {
  let fixture: ComponentFixture<ResourcesPageComponent>;
  beforeEach(async () => { await TestBed.configureTestingModule({ imports: [ResourcesPageComponent], providers: [{ provide: PublicResourceRepository, useValue: { load: async () => ({ categories: [{ id: 'forms', title: 'Forms', icon: 'x', sortOrder: 1, publicationState: 'published', slug: 'forms', description: '', createdAt: '', updatedAt: '' }, { id: 'governance', title: 'Governance', icon: 'x', sortOrder: 2, publicationState: 'published', slug: 'governance', description: '', createdAt: '', updatedAt: '' }], resources }) } }] }).compileComponents(); fixture = TestBed.createComponent(ResourcesPageComponent); fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges(); });
  it('searches, filters, and sorts persistent records', () => { const page = fixture.componentInstance as any; page.query = 'membership'; expect(page.filteredDocuments.map((x: ResourceDocument) => x.id)).toEqual(['form']); page.query = ''; page.selectCategory('governance'); expect(page.filteredDocuments[0].id).toBe('minutes'); });
  it('renders safe previews and downloads', () => { const page = fixture.componentInstance as any; page.query = 'Membership'; fixture.detectChanges(); expect(fixture.debugElement.query(By.css('a[target="_blank"]')).attributes['rel']).toBe('noopener noreferrer'); expect(fixture.debugElement.query(By.css('a[download]')).attributes['href']).toBe('/form.pdf'); });
  it('renders request-only records without a download', () => { const page = fixture.componentInstance as any; page.query = 'Minutes'; fixture.detectChanges(); expect(fixture.debugElement.query(By.css('a[download]'))).toBeNull(); expect(fixture.debugElement.query(By.css('.request')).attributes['href']).toContain('mailto:'); });
});
