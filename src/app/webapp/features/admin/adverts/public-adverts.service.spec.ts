import { AdvertDocument } from '../../../../core/firebase/models/firestore-data.models';
import { filterPublicAdverts, PublicAdvertsService } from './public-adverts.service';

describe('public advert filtering', () => {
  const advert = (id:string, status:AdvertDocument['status'], startAt:string, endAt:string, sortPriority=0):AdvertDocument => ({ id, advertiserName:'A', title:id, body:'B', placement:'dashboard_hero', status, startAt, endAt, sortPriority, ownerAdminId:'admin', createdByAdminId:'admin', updatedByAdminId:'admin', createdAt:'2026-01-01', updatedAt:'2026-01-01' });
  const now = new Date('2026-08-31T12:00:00.000Z');
  it('includes both exact schedule boundaries and excludes outside or non-active adverts', () => {
    const result=filterPublicAdverts([advert('starts','active',now.toISOString(),'2026-09-01T00:00:00Z'), advert('ends','active','2026-08-01T00:00:00Z',now.toISOString()), advert('future','active','2026-09-01T00:00:00Z','2026-10-01T00:00:00Z'), advert('draft','draft','2026-08-01T00:00:00Z','2026-09-01T00:00:00Z')],now);
    expect(result.map(x=>x.id)).toEqual(['ends','starts']);
  });
  it('sorts by descending priority and filters placement', () => expect(filterPublicAdverts([advert('low','active','2026-08-01','2026-09-01',1), { ...advert('other','active','2026-08-01','2026-09-01',10), placement:'directory' }, advert('high','active','2026-08-01','2026-09-01',5)],now,'dashboard_hero').map(x=>x.id)).toEqual(['high','low']));
  it('reads adverts without an authentication token', async () => {
    const list=jasmine.createSpy().and.resolveTo([]); const service=new PublicAdvertsService({ adverts:{ list } } as any);
    await service.listActive(); expect(list).toHaveBeenCalledOnceWith();
  });
});
