'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const { schedulingPatch } = require('./publication-scheduler');
const event = { publicationMode:'scheduled', visibleFrom:'2026-01-01T10:00:00Z', visibleUntil:'2026-01-01T11:00:00Z', startAt:'2027-01-01T00:00:00Z', status:'draft', schedulingState:'pending', isPublic:false };
const project = { publicationMode:'scheduled', visibleFrom:'2026-01-01T10:00:00Z', visibleUntil:'2026-01-01T11:00:00Z', publicationState:'draft', schedulingState:'pending', isPublic:false };
for (const [name, record] of [['event', event], ['project', project]]) {
 test(`${name}: future remains non-public`,()=>assert.equal(schedulingPatch(record,new Date('2026-01-01T09:59:59Z')),null));
 test(`${name}: start boundary activates`,()=>assert.equal(schedulingPatch(record,new Date('2026-01-01T10:00:00Z')).isPublic,true));
 test(`${name}: active processing is idempotent`,()=>{const active={...record,...schedulingPatch(record,new Date('2026-01-01T10:30:00Z'))}; assert.equal(schedulingPatch(active,new Date('2026-01-01T10:30:00Z')),null);});
 test(`${name}: end boundary expires`,()=>{const p=schedulingPatch(record,new Date('2026-01-01T11:00:00Z')); assert.equal(p.schedulingState,'expired'); assert.equal(p.isPublic,false);});
 test(`${name}: manual is ignored`,()=>assert.equal(schedulingPatch({...record,publicationMode:'manual'},new Date('2026-01-01T10:30:00Z')),null));
 test(`${name}: offset instants preserve timezone meaning`,()=>assert.equal(schedulingPatch({...record,visibleFrom:'2026-01-01T12:00:00+02:00'},new Date('2026-01-01T10:00:00Z')).isPublic,true));
}
