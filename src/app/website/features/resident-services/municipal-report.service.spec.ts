import { MunicipalReportService } from './municipal-report.service';

describe('MunicipalReportService', () => {
  let service: MunicipalReportService;
  let functions: jasmine.SpyObj<any>;

  beforeEach(() => {
    functions = jasmine.createSpyObj('FirebaseFunctionsService', ['call']);
    service = new MunicipalReportService(functions);
  });

  it('loads a bounded page and reports whether another page exists', async () => {
    const rows = Array.from({ length: 21 }, (_, index) => ({ document: { fields: {
      id: { stringValue: `r${index}` }, referenceNumber: { stringValue: `PNRA-${index}` }, createdAt: { timestampValue: '2026-01-01T00:00:00Z' }
    } } }));
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify(rows), { status: 200 }));
    const result = await service.listPage('token', 2);
    expect(result.reports.length).toBe(20); expect(result.hasNextPage).toBeTrue(); expect(result.page).toBe(2);
    const query = JSON.parse((window.fetch as jasmine.Spy).calls.mostRecent().args[1].body as string).structuredQuery;
    expect(query.limit).toBe(21); expect(query.offset).toBe(40);
  });

  it('loads only active administrator assignees', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify([]), { status: 200 }));
    await service.listAssignees('token');
    const query = JSON.parse((window.fetch as jasmine.Spy).calls.mostRecent().args[1].body as string).structuredQuery;
    expect(query.limit).toBe(100);
    expect(JSON.stringify(query.where)).toContain('super_admin');
    expect(JSON.stringify(query.where)).toContain('active');
  });

  it('sends assignment and transition updates through the callable function', async () => {
    functions.call.and.resolveTo(undefined);
    await service.update('report-1', 'assigned', 'admin-1', 'Taking ownership', 'token');
    expect(functions.call).toHaveBeenCalledWith('manageMunicipalReport', {
      reportId: 'report-1', status: 'assigned', assigneeId: 'admin-1', resolutionNote: 'Taking ownership'
    }, 'token');
  });

  it('surfaces failed updates without changing client data', async () => {
    functions.call.and.rejectWith(new Error('Update failed'));
    await expectAsync(service.update('report-1', 'closed', 'admin-1', 'Fixed', 'token')).toBeRejectedWithError('Update failed');
  });
});
