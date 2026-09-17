#!/usr/bin/env node
'use strict';
const { getApps, initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const source = require('./community-content-data');

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function validate(records) {
  const seen = new Set();
  for (const record of records) {
    if (!record.id || !slugPattern.test(record.id)) throw new Error(`Invalid deterministic id: ${record.id}`);
    const key = `${record.collection}/${record.id}`;
    if (seen.has(key)) throw new Error(`Duplicate migration record: ${key}`);
    if (!record.data.createdAt || !record.data.updatedAt) throw new Error(`Missing audit timestamps: ${key}`);
    seen.add(key);
  }
  return records;
}
function buildMigrationRecords(now = '2026-01-01T00:00:00.000Z') {
  const audit = { createdAt: now, updatedAt: now };
  return validate([
    ...source.committee.map(([slug,name,role,description],displayOrder)=>({collection:'committeeMembers',id:slug,data:{id:slug,slug,name,role,description,displayOrder,image:{url:'',altText:`Portrait of ${name}`},publicationState:'published',publishedAt:now,...audit}})),
    ...source.portfolios.map(([slug,icon,title,description],displayOrder)=>({collection:'communityPortfolios',id:slug,data:{id:slug,slug,name:title,title,description,details:[description],icon,displayOrder,publicationState:'published',publishedAt:now,...audit}})),
    ...source.events.map(([slug,title,startAt,endAt,venue])=>({collection:'events',id:slug,data:{id:slug,slug,title,summary:title,description:title,category:'Community',venue,startAt,endAt,image:{url:'',altText:title},status:'published',featured:false,publishedAt:now,...audit}})),
    ...source.projects.map(([slug,title,category])=>({collection:'communityProjects',id:slug,data:{id:slug,slug,title,summary:title,content:title,category,status:'active',image:{url:'',altText:title},progress:0,featured:false,publicationState:'published',publishedAt:now,...audit}}))
  ]);
}
async function importCommunityContent(db, { dryRun = false, now } = {}) {
  const records = buildMigrationRecords(now);
  if (!dryRun) {
    const batch = db.batch();
    for (const record of records) batch.set(db.collection(record.collection).doc(record.id), record.data, { merge: true });
    await batch.commit();
  }
  return { dryRun, count: records.length, paths: records.map(record => `${record.collection}/${record.id}`) };
}
function parseArgs(argv) {
  const projectIndex = argv.indexOf('--project');
  const projectId = projectIndex >= 0 ? argv[projectIndex + 1] : undefined;
  if (!projectId || projectId.startsWith('--')) throw new Error('Explicit Firebase project selection is required: --project <project-id>');
  return { projectId, dryRun: argv.includes('--dry-run') };
}
async function main() {
  const options = parseArgs(process.argv.slice(2));
  const app = getApps()[0] || initializeApp({ credential: applicationDefault(), projectId: options.projectId });
  const result = await importCommunityContent(getFirestore(app), options);
  console.log(`${result.dryRun ? 'Dry run:' : 'Imported'} ${result.count} deterministic documents into ${options.projectId}.`);
}
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { buildMigrationRecords, importCommunityContent, parseArgs, validate };
