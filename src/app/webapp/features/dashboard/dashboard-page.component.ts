import { Component } from '@angular/core';
import { WelcomeHeroComponent } from './components/welcome-hero/welcome-hero.component';
import { CategoryShortcutsComponent, ShortcutTile } from './components/category-shortcuts/category-shortcuts.component';
import { FeaturedActionComponent } from './components/featured-action/featured-action.component';
import { BrowseSpecialistsComponent, Specialist } from './components/browse-specialists/browse-specialists.component';
import { TrustPoint, TrustSectionComponent } from './components/trust-section/trust-section.component';
import { Testimonial, TestimonialsComponent } from './components/testimonials/testimonials.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    WelcomeHeroComponent,
    CategoryShortcutsComponent,
    FeaturedActionComponent,
    BrowseSpecialistsComponent,
    TrustSectionComponent,
    TestimonialsComponent
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {
  readonly shortcutTiles: ShortcutTile[] = [
    { icon: '🔧', title: 'Appliance Repair', description: 'Fridge, oven, washer and dryer fixes.' },
    { icon: '⚡', title: 'Electrician', description: 'Wiring, panel updates, and lighting installs.' },
    { icon: '🚿', title: 'Plumber', description: 'Leaks, drains, toilets, and water heater support.' },
    { icon: '🛠️', title: 'Handyman', description: 'Mounting, patching, and everyday home tasks.' }
  ];

  readonly specialists: Specialist[] = [
    {
      name: 'Marcus Sterling',
      role: 'Master Electrician • Sterling Power Solutions',
      tags: ['Panel Upgrades', 'EV Charging', 'Smart Home'],
      rating: '4.9 (128 reviews)',
      availability: 'Available today',
      image: 'https://images.unsplash.com/photo-1581092919535-7146ff1a590c?auto=format&fit=crop&w=220&q=80'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Commercial Specialist • Voltage Artisans',
      tags: ['Industrial Wiring', 'Lighting Design'],
      rating: '5.0 (84 reviews)',
      availability: 'Next available tomorrow',
      image: 'https://images.unsplash.com/photo-1595956553066-fe24a8c33395?auto=format&fit=crop&w=220&q=80'
    },
    {
      name: 'David Chen',
      role: 'Licensed Electrician • Chen & Sons Electrical',
      tags: ['Emergency Repairs', 'New Construction'],
      rating: '4.8 (215 reviews)',
      availability: 'Available today',
      image: 'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?auto=format&fit=crop&w=220&q=80'
    }
  ];

  readonly trustPoints: TrustPoint[] = [
    {
      icon: '🛡️',
      title: 'Guardian Guarantee',
      description: 'If a service misses the mark, we’ll make it right with a follow-up at no extra cost.'
    },
    {
      icon: '✅',
      title: 'Verified Professionals',
      description: 'Every pro is background checked, licensed, and continuously rated by local residents.'
    },
    {
      icon: '📞',
      title: '24/7 Support',
      description: 'Talk to a real person day or night when urgent home issues happen.'
    }
  ];

  readonly testimonials: Testimonial[] = [
    {
      rating: 5,
      quote: 'The electrician arrived on time, explained every step, and left everything spotless.',
      name: 'Martha J.',
      neighborhood: 'Maple Street'
    },
    {
      rating: 5,
      quote: 'Booking was easy, communication was clear, and the repair was done in one visit.',
      name: 'Jordan K.',
      neighborhood: 'Cedar Heights'
    },
    {
      rating: 4,
      quote: 'Great experience overall. Helpful recommendations and no surprise pricing.',
      name: 'Ava R.',
      neighborhood: 'West Park'
    }
  ];
}
