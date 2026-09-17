import { AdvertDocument } from '../../../../core/firebase/models/firestore-data.models';
import { AdvertAdminService } from './advert-admin.service';

describe('AdvertAdminService', () => {
  const advert = (): AdvertDocument => ({ id:'ad', advertiserName:'Cafe', title:'Breakfast', body:'Daily', placement:'dashboard_hero', status:'scheduled', isPublic:false, startAt:'2099-01-01T00:00:00Z', endAt:'2099-02-01T00:00:00Z', sortPriority:1, ownerAdminId:'owner', createdByAdminId:'owner', updatedByAdminId:'owner', createdAt:'2026-01-01', updatedAt:'2026-01-01' });
  function setup(authenticated=true, admin=true) {
    const adverts={ list:jasmine.createSpy().and.resolveTo([]), getById:jasmine.createSpy(), upsert:jasmine.createSpy().and.callFake(async (value:AdvertDocument)=>value), remove:jasmine.createSpy().and.resolveTo() };
    return { adverts, service:new AdvertAdminService({ adverts } as any, { isAuthenticated:()=>authenticated, authUser:()=>({ id:'user', idToken:'token' }) } as any, { isAdmin:()=>admin } as any, { upload:jasmine.createSpy() } as any) };
  }
  it('rejects listing by non-administrators', async () => await expectAsync(setup(true,false).service.list()).toBeRejectedWithError('Administrator access is required.'));
  it('rejects writes by anonymous users', async () => await expectAsync(setup(false,false).service.create({} as any)).toBeRejectedWithError('Administrator access is required.'));
  it('records actor, visibility, and activation/deactivation timestamps', async () => {
    const { service }=setup();
    const active=await service.setStatus(advert(),'active');
    expect(active.isPublic).toBeTrue(); expect(active.activatedByAdminId).toBe('user'); expect(active.activatedAt).toBeTruthy();
    const inactive=await service.setStatus(active,'inactive');
    expect(inactive.isPublic).toBeFalse(); expect(inactive.deactivatedByAdminId).toBe('user'); expect(inactive.deactivatedAt).toBeTruthy();
  });
  it('preserves status during ordinary edits', async () => {
    const { service }=setup(); const existing=advert();
    const result=await service.update(existing, { ...existing, status:'active', title:'Changed' });
    expect(result.status).toBe('scheduled'); expect(result.isPublic).toBeFalse(); expect(result.updatedByAdminId).toBe('user');
  });
  it('deletes with administrator credentials and propagates failures', async () => {
    const { service, adverts }=setup(); await service.delete(advert()); expect(adverts.remove).toHaveBeenCalledOnceWith('ad','token');
    adverts.remove.and.rejectWith(new Error('delete failed')); await expectAsync(service.delete(advert())).toBeRejectedWithError('delete failed');
  });
});
