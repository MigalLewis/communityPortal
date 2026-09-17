import { TestBed } from '@angular/core/testing';
import { FirestoreDataService } from '../../../core/firebase/services/firestore-data.service';
import { PublicEventsService } from './public-events.service';

describe('PublicEventsService', () => {
  it('chooses the earliest explicitly featured event deterministically', () => {
    TestBed.configureTestingModule({ providers:[PublicEventsService,{provide:FirestoreDataService,useValue:{}}] });
    const service=TestBed.inject(PublicEventsService); const base:any={status:'published',featured:true};
    expect(service.featured([{...base,id:'b',startAt:'2027-01-01'},{...base,id:'a',startAt:'2027-01-01'}])?.id).toBe('a');
  });
});
