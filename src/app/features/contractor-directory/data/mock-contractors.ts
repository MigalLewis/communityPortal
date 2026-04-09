import { Contractor, ContractorProfile } from '../models/contractor.model';

export const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: 'c1',
    name: 'Marcus Sterling',
    company: 'Sterling Power Solutions',
    category: 'Electrical',
    area: 'Downtown',
    rating: 4.9,
    reviewCount: 128,
    verified: true,
    availableToday: true,
    phone: '(555) 230-9941',
    tags: ['Panel Upgrades', 'EV Charging', 'Smart Home']
  },
  {
    id: 'c2',
    name: 'Elena Rodriguez',
    company: 'Voltage Artisans',
    category: 'Electrical',
    area: 'Northside',
    rating: 5.0,
    reviewCount: 84,
    verified: true,
    availableToday: false,
    phone: '(555) 882-1044',
    tags: ['Industrial Wiring', 'Lighting Design']
  },
  {
    id: 'c3',
    name: 'David Chen',
    company: 'Chen & Sons Electrical',
    category: 'Electrical',
    area: 'Midtown',
    rating: 4.8,
    reviewCount: 215,
    verified: true,
    availableToday: true,
    phone: '(555) 912-3320',
    tags: ['Emergency Repairs', 'New Construction']
  },
  {
    id: 'c4',
    name: 'Renee Harper',
    company: 'Harper Flow Works',
    category: 'Plumbing',
    area: 'West End',
    rating: 4.7,
    reviewCount: 66,
    verified: false,
    availableToday: true,
    phone: '(555) 610-8812',
    tags: ['Leak Detection', 'Water Heaters']
  },
  {
    id: 'c5',
    name: 'Ibrahim Khan',
    company: 'Khan Climate Care',
    category: 'HVAC',
    area: 'Downtown',
    rating: 4.6,
    reviewCount: 143,
    verified: true,
    availableToday: false,
    phone: '(555) 401-6570',
    tags: ['AC Repair', 'Duct Cleaning']
  },
  {
    id: 'c6',
    name: 'Maya Patel',
    company: 'Patel Precision Build',
    category: 'General Contracting',
    area: 'South Park',
    rating: 4.9,
    reviewCount: 102,
    verified: true,
    availableToday: true,
    phone: '(555) 724-1190',
    tags: ['Remodeling', 'Kitchen Renovation']
  },
  {
    id: 'c7',
    name: 'Thomas Greene',
    company: 'Greene Roofing Co.',
    category: 'Roofing',
    area: 'Northside',
    rating: 4.5,
    reviewCount: 59,
    verified: false,
    availableToday: true,
    phone: '(555) 550-7789',
    tags: ['Roof Repair', 'Shingle Installation']
  },
  {
    id: 'c8',
    name: 'Lila Morgan',
    company: 'Morgan Secure Homes',
    category: 'Electrical',
    area: 'Old Town',
    rating: 4.8,
    reviewCount: 91,
    verified: true,
    availableToday: false,
    phone: '(555) 300-4492',
    tags: ['Security Systems', 'Smart Home']
  }
];

export const MOCK_CONTRACTOR_PROFILES: Record<string, ContractorProfile> = {
  c1: {
    id: 'c1',
    yearsInBusiness: 12,
    about:
      'Sterling Power Solutions specializes in residential and light-commercial electrical upgrades with a focus on energy efficiency and clean installations.',
    licenses: ['State Electrical License #E-44291', 'EV Installer Certified'],
    insurance: '$2M general liability',
    responseTime: 'Typically replies in under 30 minutes',
    completionRate: '98% projects completed on time',
    verificationBadges: ['Background Check', 'License Verified', 'Insurance Verified', 'Top Rated Pro'],
    services: ['Panel Upgrades', 'EV Charging Installation', 'Smart Home Wiring', 'Lighting Retrofits', 'Safety Inspections'],
    areasServed: ['Downtown', 'Midtown', 'Northside', 'Old Town'],
    gallery: [
      'Modern panel upgrade with labeled breakers and surge protection.',
      'Dual EV charger setup in a two-car garage.',
      'Kitchen recessed lighting and under-cabinet accent system.'
    ],
    reviews: [
      {
        author: 'Ava J.',
        rating: 5,
        date: '2026-02-14',
        comment: 'Very professional, explained every step clearly, and finished ahead of schedule.'
      },
      {
        author: 'Noah P.',
        rating: 5,
        date: '2026-01-29',
        comment: 'Installed EV charger cleanly and passed inspection first try.'
      },
      {
        author: 'Mia L.',
        rating: 4.8,
        date: '2025-12-12',
        comment: 'Great communication and fair pricing. Would hire again.'
      }
    ]
  },
  c2: {
    id: 'c2',
    yearsInBusiness: 9,
    about: 'Voltage Artisans provides precision electrical design and installation for modern homes and retail interiors.',
    licenses: ['State Electrical License #E-33804'],
    insurance: '$1M general liability',
    responseTime: 'Responds within 1 hour',
    completionRate: '96% projects completed on time',
    verificationBadges: ['License Verified', 'Insurance Verified', 'Women-Owned Business'],
    services: ['Lighting Design', 'Industrial Wiring', 'Tenant Improvements', 'Service Panel Diagnostics'],
    areasServed: ['Northside', 'Downtown', 'Harbor District'],
    gallery: ['Retail lighting plan and installation.', 'Industrial conduit run with code-compliant labeling.'],
    reviews: [
      {
        author: 'Ethan C.',
        rating: 5,
        date: '2026-03-08',
        comment: 'Amazing eye for detail and excellent craftsmanship.'
      },
      {
        author: 'Sophia R.',
        rating: 4.9,
        date: '2026-02-01',
        comment: 'Professional team and transparent estimate process.'
      }
    ]
  },
  c3: {
    id: 'c3',
    yearsInBusiness: 16,
    about: 'Chen & Sons Electrical handles emergency electrical services, new construction, and full-system troubleshooting.',
    licenses: ['Master Electrician #ME-7712', 'Contractor License #C-22019'],
    insurance: '$3M general liability',
    responseTime: '24/7 dispatch for emergency requests',
    completionRate: '99% projects completed on time',
    verificationBadges: ['Background Check', 'License Verified', 'Insurance Verified', 'Emergency Response'],
    services: ['Emergency Repairs', 'New Construction Wiring', 'Whole-Home Rewires', 'Generator Transfers'],
    areasServed: ['Midtown', 'Downtown', 'West End', 'Northside'],
    gallery: ['Emergency service restoration after storm damage.', 'New construction rough-in and fixture installation.'],
    reviews: [
      {
        author: 'Liam D.',
        rating: 5,
        date: '2026-03-22',
        comment: 'Fast response during an outage and excellent follow-up.'
      },
      {
        author: 'Isabella W.',
        rating: 4.7,
        date: '2026-02-16',
        comment: 'Team was efficient and respectful of our home.'
      }
    ]
  }
};
