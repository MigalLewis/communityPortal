import { AdvertAdminService } from './advert-admin.service';

describe('AdvertAdminService authorization', () => {
  function service(authenticated:boolean, admin:boolean) { return new AdvertAdminService({ adverts:{ list:jasmine.createSpy(), upsert:jasmine.createSpy() } } as any, { isAuthenticated:()=>authenticated, authUser:()=>({ id:'user', idToken:'token' }) } as any, { isAdmin:()=>admin } as any); }
  it('rejects listing by non-administrators', async () => await expectAsync(service(true,false).list()).toBeRejectedWithError('Administrator access is required.'));
  it('rejects writes by anonymous users', async () => await expectAsync(service(false,false).create({} as any)).toBeRejectedWithError('Administrator access is required.'));
});
