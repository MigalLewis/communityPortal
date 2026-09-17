import { validateEvent } from './event-validation';

describe('validateEvent', () => {
  const valid = { slug:'market-day', title:'Market', summary:'Summary', description:'Details', category:'Community', venue:'Green', startAt:'2026-10-01T09:00:00Z', endAt:'2026-10-01T10:00:00Z', image:{url:'image.jpg',altText:'Neighbours at the market'}, featured:false };
  it('accepts complete chronological event content', () => expect(validateEvent(valid)).toEqual([]));
  it('rejects invalid slugs, dates, content, venue, and image text', () => expect(validateEvent({ ...valid, slug:'Bad Slug', description:'', venue:'', endAt:valid.startAt, image:{url:'image.jpg',altText:''} }).length).toBe(5));
});
