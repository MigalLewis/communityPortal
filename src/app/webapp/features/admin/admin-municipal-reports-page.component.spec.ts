import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../auth/services/auth.service';
import { MunicipalReport } from '../../../website/features/resident-services/municipal-report.models';
import { MunicipalReportService } from '../../../website/features/resident-services/municipal-report.service';
import { AdminMunicipalReportsPageComponent } from './admin-municipal-reports-page.component';

describe('AdminMunicipalReportsPageComponent', () => {
  let fixture: ComponentFixture<AdminMunicipalReportsPageComponent>;
  let service: jasmine.SpyObj<MunicipalReportService>;
  const report: MunicipalReport = { id: 'r1', referenceNumber: 'PNRA-1', ownerId: 'resident', category: 'roads', entity: 'Johannesburg Roads Agency', location: 'Main Road', description: 'A dangerous pothole in the road', cityReference: '', contactPreference: 'email', attachments: [], status: 'submitted', assigneeId: null, createdAt: '2026-01-01', updatedAt: '2026-01-01' };

  beforeEach(async () => {
    service = jasmine.createSpyObj('MunicipalReportService', ['listPage', 'listAssignees', 'update']);
    service.listPage.and.resolveTo({ reports: [report], page: 0, hasNextPage: false });
    service.listAssignees.and.resolveTo([{ id: 'admin-1', fullName: 'Admin One', email: 'admin@example.test' }]);
    service.update.and.resolveTo();
    await TestBed.configureTestingModule({ imports: [AdminMunicipalReportsPageComponent], providers: [
      { provide: MunicipalReportService, useValue: service }, { provide: AuthService, useValue: { authUser: () => ({ idToken: 'token' }) } }
    ] }).compileComponents();
    fixture = TestBed.createComponent(AdminMunicipalReportsPageComponent);
  });

  it('loads reports and valid assignees', async () => {
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('PNRA-1');
    expect(fixture.nativeElement.textContent).toContain('Admin One');
  });

  it('shows separate empty and filtered no-results states', async () => {
    fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance as any; component.textFilter = 'not present'; fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No reports match these filters');
    component.reports.set([]); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No municipal reports have been submitted');
  });

  it('requires a resolution note when closing', async () => {
    fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.edits.r1.status = 'closed'; await component.save(report); fixture.detectChanges();
    expect(service.update).not.toHaveBeenCalled(); expect(fixture.nativeElement.textContent).toContain('resolution note');
  });

  it('does not mutate the loaded report after a failed update', async () => {
    service.update.and.rejectWith(new Error('Network failed'));
    fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.edits.r1.status = 'assigned'; component.edits.r1.assigneeId = 'admin-1'; await component.save(report); fixture.detectChanges();
    expect(component.reports()[0].status).toBe('submitted'); expect(fixture.nativeElement.textContent).toContain('Network failed');
  });

  it('prevents duplicate submissions and reports success for the saved report', async () => {
    let finish!: () => void; service.update.and.returnValue(new Promise<void>((resolve) => finish = resolve));
    fixture.detectChanges(); await fixture.whenStable(); const component = fixture.componentInstance as any;
    component.edits.r1.status = 'assigned'; component.edits.r1.assigneeId = 'admin-1';
    const first = component.save(report); await component.save(report); expect(service.update).toHaveBeenCalledTimes(1);
    finish(); await first; fixture.detectChanges(); expect(fixture.nativeElement.textContent).toContain('updated successfully');
  });
});
