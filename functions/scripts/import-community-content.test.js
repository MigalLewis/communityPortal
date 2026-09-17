'use strict';
const test = require('node:test'); const assert = require('node:assert/strict');
const { buildMigrationRecords, importCommunityContent, parseArgs } = require('./import-community-content');
class FakeDb { constructor(){this.documents=new Map();this.pending=[];}collection(name){return{doc:id=>({path:`${name}/${id}`})};}batch(){return{set:(ref,data,options)=>this.pending.push({ref,data,options}),commit:async()=>{for(const write of this.pending)this.documents.set(write.ref.path,{...(this.documents.get(write.ref.path)||{}),...write.data});this.pending=[];}};} }
test('uses unique deterministic document paths',()=>{const records=buildMigrationRecords();assert.equal(new Set(records.map(x=>`${x.collection}/${x.id}`)).size,records.length);});
test('repeated safe upserts do not create duplicates',async()=>{const db=new FakeDb();const first=await importCommunityContent(db);await importCommunityContent(db);assert.equal(db.documents.size,first.count);});
test('dry run validates without writing',async()=>{const db=new FakeDb();const result=await importCommunityContent(db,{dryRun:true});assert.ok(result.count>0);assert.equal(db.documents.size,0);});
test('requires an explicit project',()=>{assert.throws(()=>parseArgs(['--dry-run']),/Explicit Firebase project/);assert.deepEqual(parseArgs(['--project','demo','--dry-run']),{projectId:'demo',dryRun:true});});
