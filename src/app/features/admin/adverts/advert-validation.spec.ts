import { AdvertInput, validateAdvert } from './advert-validation';

describe('advert validation', () => {
  const valid = (): AdvertInput => ({ advertiserName:'Local Cafe', title:'Breakfast', body:'Open daily', placement:'dashboard_hero', status:'scheduled', startAt:'2026-08-01T00:00:00.000Z', endAt:'2026-09-01T00:00:00.000Z', sortPriority:2 });
  it('accepts a valid advert', () => expect(validateAdvert(valid())).toEqual([]));
  it('rejects missing content, invalid URLs, priority, and reversed schedules', () => {
    expect(validateAdvert({ ...valid(), advertiserName:' ', title:'', body:'', startAt:'2026-09-02T00:00:00Z', endAt:'2026-09-01T00:00:00Z', sortPriority:-1, media:{ url:'javascript:bad', type:'image', altText:'' }, link:{ url:'bad', label:'', target:'new_window' } }).length).toBe(7);
  });
});
