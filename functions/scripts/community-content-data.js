'use strict';

// Canonical legacy constants. Keep this file dependency-free so both the migration
// and its tests can load it without compiling the Angular application.
const committee = [
  ['jane-doe', 'Jane Doe', 'Chairperson', 'Oversees general operations and the strategic direction of the PNRA.'],
  ['john-smith', 'John Smith', 'Security Portfolio', 'Manages relationships with security providers and SAPS.'],
  ['sarah-lee', 'Sarah Lee', 'Environmental Affairs', 'Leads park maintenance and community greening initiatives.'],
  ['david-chen', 'David Chen', 'Town Planning', 'Reviews development proposals and protects heritage assets.']
];
const portfolios = [
  ['civic-affairs','⌂','Civic Affairs','Representing residents on municipal services and infrastructure.'],
  ['environmental-affairs','♧','Environmental Affairs','Protecting parks, trees and the natural character of the suburb.'],
  ['security','⬡','Security','Supporting collaboration between residents and local safety partners.'],
  ['town-planning-and-heritage','△','Town Planning & Heritage','Monitoring planning matters and encouraging responsible heritage stewardship.'],
  ['community-forums','◌','Community Forums','Creating useful channels for resident participation.'],
  ['projects','⚒','Projects','Coordinating practical improvements to shared neighbourhood spaces.']
];
const events = [
  ['spring-community-market-day','Spring Community Market Day','2026-10-15T07:00:00.000Z','2026-10-15T12:00:00.000Z','Parktown North Green Strip'],
  ['pnra-annual-general-meeting','PNRA Annual General Meeting','2026-11-02T16:30:00.000Z','2026-11-02T18:00:00.000Z',"St. Teresa's School Hall"],
  ['spring-neighbourhood-cleanup','Spring Neighbourhood Cleanup','2026-11-18T06:00:00.000Z','2026-11-18T09:00:00.000Z','Meet at the Corner Café'],
  ['festive-season-security-briefing','Festive Season Security Briefing','2026-12-05T17:00:00.000Z','2026-12-05T18:00:00.000Z','Online']
];
const projects = [
  ['pocket-park','Pocket Park Initiative','Environment'],['adopt-a-box','Adopt-a-Box','Infrastructure'],
  ['bollard-project','Bollard Project','Safety'],['community-in-action-squad','Community-in-Action Squad','Community'],
  ['graffiti-abatement','Graffiti Abatement','Community']
];
module.exports = { committee, portfolios, events, projects };
