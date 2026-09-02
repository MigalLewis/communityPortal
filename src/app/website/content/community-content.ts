export interface CommunityContent {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  details: string[];
}

export interface ProjectContent extends CommunityContent {
  status: string;
  category: string;
}

export interface EventContent extends CommunityContent {
  date: string;
  time: string;
  location: string;
}

export const PROJECTS: readonly ProjectContent[] = [
  { slug: 'pocket-park', title: 'Pocket Park Initiative', eyebrow: 'Community project', summary: 'Transforming underused neighbourhood corners into welcoming green spaces.', details: ['The initiative creates small, accessible places where neighbours can meet and relax.', 'Phase two focuses on planting, seating and long-term community stewardship.'], status: 'Ongoing', category: 'Environment' },
  { slug: 'adopt-a-box', title: 'Adopt-a-Box', eyebrow: 'Community project', summary: 'Beautifying street infrastructure through community-sponsored art on utility boxes.', details: ['Local sponsors and artists turn essential street infrastructure into cared-for neighbourhood landmarks.'], status: 'Ongoing', category: 'Infrastructure' },
  { slug: 'bollard-project', title: 'Bollard Project', eyebrow: 'Community project', summary: 'Protective bollards make key pedestrian routes safer.', details: ['The completed installation helps protect busy pedestrian edges and public spaces.'], status: 'Completed', category: 'Safety' },
  { slug: 'community-in-action-squad', title: 'Community-in-Action Squad', eyebrow: 'Community project', summary: 'A volunteer team responding to minor maintenance issues around the suburb.', details: ['Residents coordinate practical clean-up and maintenance tasks with PNRA.'], status: 'Ongoing', category: 'Community' },
  { slug: 'graffiti-abatement', title: 'Graffiti Abatement', eyebrow: 'Community project', summary: 'Rapid graffiti removal helps keep local streets cared for.', details: ['The Community-in-Action Squad identifies and addresses graffiti in shared public areas.'], status: 'Active', category: 'Community' }
];

export const EVENTS: readonly EventContent[] = [
  { slug: 'spring-community-market-day', title: 'Spring Community Market Day', eyebrow: 'Community gathering', summary: 'Local food, crafts, music and family activities welcome the new season.', details: ['Meet neighbourhood creators and spend the day connecting with fellow residents.'], date: '15 October 2026', time: '09:00 – 14:00', location: 'Parktown North Green Strip' },
  { slug: 'pnra-annual-general-meeting', title: 'PNRA Annual General Meeting', eyebrow: 'Community meeting', summary: 'Join the committee for the annual update and community discussion.', details: ['Members and residents can hear portfolio updates and discuss neighbourhood priorities.'], date: '2 November 2026', time: '18:30 – 20:00', location: "St. Teresa's School Hall" },
  { slug: 'spring-neighbourhood-cleanup', title: 'Spring Neighbourhood Cleanup', eyebrow: 'Environment event', summary: 'Help make our streets cleaner, greener and more welcoming.', details: ['Bring comfortable shoes and join neighbours for a coordinated morning clean-up.'], date: '18 November 2026', time: '08:00 – 11:00', location: 'Meet at the Corner Café' },
  { slug: 'festive-season-security-briefing', title: 'Festive Season Security Briefing', eyebrow: 'Security event', summary: 'Practical seasonal guidance and an update from local partners.', details: ['The online briefing covers practical precautions and community security coordination.'], date: '5 December 2026', time: '19:00 – 20:00', location: 'Online' }
];

export const PORTFOLIOS: readonly CommunityContent[] = [
  { slug: 'civic-affairs', title: 'Civic Affairs', eyebrow: 'PNRA portfolio', summary: 'Representing residents on municipal services and infrastructure.', details: ['The portfolio liaises with municipal entities and follows up on issues affecting shared infrastructure.'] },
  { slug: 'environmental-affairs', title: 'Environmental Affairs', eyebrow: 'PNRA portfolio', summary: 'Protecting parks, trees and the natural character of the suburb.', details: ['Its work includes greening, waste initiatives and care for public landscapes.'] },
  { slug: 'security', title: 'Security', eyebrow: 'PNRA portfolio', summary: 'Supporting collaboration between residents and local safety partners.', details: ['The portfolio shares safety information and coordinates with security providers and SAPS.'] },
  { slug: 'town-planning-and-heritage', title: 'Town Planning & Heritage', eyebrow: 'PNRA portfolio', summary: 'Monitoring planning matters and encouraging responsible heritage stewardship.', details: ['The portfolio follows development applications and promotes respect for zoning and heritage requirements.'] },
  { slug: 'community-forums', title: 'Community Forums', eyebrow: 'PNRA portfolio', summary: 'Creating useful channels for resident participation.', details: ['Forums, town halls and updates help residents stay informed and contribute.'] },
  { slug: 'projects', title: 'Projects', eyebrow: 'PNRA portfolio', summary: 'Coordinating practical improvements to shared neighbourhood spaces.', details: ['The portfolio supports beautification, park and community infrastructure initiatives.'] }
];

export const COMMUNITY_RESOURCES: Record<string, readonly CommunityContent[]> = {
  heritage: [
    { slug: 'parktown-north-heritage', title: 'Parktown North Heritage', eyebrow: 'Heritage resource', summary: 'An introduction to the suburb’s historic character and places.', details: ['Parktown North was established in 1903 and is known for historic homes and tree-lined streets.', 'For formal research, listings and professional guidance, consult the Johannesburg Heritage Foundation.'] }
  ],
  maps: [
    { slug: 'neighbourhood-map', title: 'Parktown North Neighbourhood Map', eyebrow: 'Map resource', summary: 'Locate Parktown North and orient yourself within the surrounding neighbourhoods.', details: ['Use the authoritative municipal and mapping links below when checking boundaries, addresses or routes.'] }
  ],
  guides: [
    { slug: 'history-of-parktown-north', title: 'History of Parktown North', eyebrow: 'Community guide', summary: 'A short overview of one of Johannesburg’s established northern suburbs.', details: ['Established in 1903, Parktown North combines historic residential character with an active contemporary community.'] },
    { slug: 'local-community', title: 'Local Community', eyebrow: 'Community guide', summary: 'Ways to connect with neighbours and take part in PNRA activity.', details: ['Attend an event, volunteer on a project or become a PNRA member to participate.'] }
  ]
};

export function findBySlug<T extends CommunityContent>(items: readonly T[], slug: string | null): T | undefined {
  return items.find((item) => item.slug === slug);
}
