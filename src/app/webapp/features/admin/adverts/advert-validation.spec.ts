import { AdvertInput, validateAdvert } from './advert-validation';

describe('advert validation', () => {
  const now = new Date('2026-08-01T00:00:00.000Z');
  const valid = (): AdvertInput => ({ advertiserName:'Local Cafe', title:'Breakfast', body:'Open daily', placement:'dashboard_hero', status:'scheduled', startAt:'2026-08-02T00:00:00.000Z', endAt:'2026-09-01T00:00:00.000Z', sortPriority:2 });
  it('accepts a valid advert', () => expect(validateAdvert(valid(), now)).toEqual([]));
  it('rejects missing content, invalid URLs, priority, and reversed schedules', () => {
    expect(validateAdvert({ ...valid(), advertiserName:' ', title:'', body:'', startAt:'2026-09-02T00:00:00Z', endAt:'2026-09-01T00:00:00Z', sortPriority:-1, media:{ url:'javascript:bad', type:'image', altText:'' }, link:{ url:'bad', label:'', target:'new_window' } }, now).length).toBe(7);
  });
  it('rejects malformed dates, unsupported placements, and expired activation windows', () => {
    const errors = validateAdvert({ ...valid(), placement:'popup' as any, startAt:'not-a-date', endAt:'2026-07-31T23:59:59Z' }, now);
    expect(errors).toContain('A valid start date is required.');
    expect(errors).toContain('Placement is not supported.');
    expect(errors).toContain('The activation window has already expired.');
  });
  it('requires meaningful media alternative text and safe links', () => {
    const errors = validateAdvert({ ...valid(), media:{ url:'https://example.test/ad.jpg', type:'image', altText:'  x ' }, link:{ url:'javascript:alert(1)', label:'Details', target:'new_window' } }, now);
    expect(errors).toContain('Media requires a valid URL and alternative text.');
    expect(errors).toContain('Link requires a valid URL and label.');
  });
});
