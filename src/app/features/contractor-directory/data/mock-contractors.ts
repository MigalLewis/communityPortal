import { Contractor } from '../models/contractor.model';

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
