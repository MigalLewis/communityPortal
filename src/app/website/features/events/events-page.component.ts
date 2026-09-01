import { Component } from '@angular/core';

type EventCategory = 'Community' | 'PNRA' | 'Meetings' | 'Environment' | 'Security';

interface CommunityEvent {
  title: string;
  category: EventCategory;
  month: string;
  day: string;
  date: string;
  time: string;
  location: string;
  icon: string;
  image: string;
  description: string;
}

@Component({
  selector: 'app-events-page',
  standalone: true,
  templateUrl: './events-page.component.html',
  styleUrl: './events-page.component.scss'
})
export class EventsPageComponent {
  protected readonly filters = ['All', 'Community', 'PNRA', 'Meetings', 'Environment', 'Security'];
  protected activeFilter = 'All';
  protected view: 'grid' | 'calendar' = 'grid';

  protected readonly featured: CommunityEvent = {
    title: 'Spring Community Market Day', category: 'Community', month: 'Oct', day: '15', date: '2026-10-15',
    time: '09:00 – 14:00', location: 'Parktown North Green Strip', icon: '⌖',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=88',
    description: 'Join us for our annual Spring Market! Enjoy local artisanal food, crafts from neighbourhood creators, live music, and activities for the kids.'
  };

  protected readonly events: CommunityEvent[] = [
    { title: 'PNRA Annual General Meeting', category: 'Meetings', month: 'Nov', day: '02', date: '2026-11-02', time: '18:30 – 20:00', location: "St. Teresa's School Hall", icon: '⌖', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85', description: 'Join the committee for our annual update and community discussion.' },
    { title: 'Spring Neighbourhood Cleanup', category: 'Environment', month: 'Nov', day: '18', date: '2026-11-18', time: '08:00 – 11:00', location: 'Meet at the Corner Café', icon: '⌖', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=85', description: 'Help make our streets cleaner, greener, and even more welcoming.' },
    { title: 'Festive Season Security Briefing', category: 'Security', month: 'Dec', day: '05', date: '2026-12-05', time: '19:00 – 20:00', location: 'Online (Zoom link)', icon: '◉', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=900&q=85', description: 'Practical security guidance and an update from our local partners.' }
  ];

  protected get filteredEvents(): CommunityEvent[] {
    if (this.activeFilter === 'All') return this.events;
    if (this.activeFilter === 'PNRA') return this.events.filter(({ title }) => title.startsWith('PNRA'));
    return this.events.filter(({ category }) => category === this.activeFilter);
  }

  protected selectFilter(filter: string): void { this.activeFilter = filter; }

  protected addToCalendar(event: CommunityEvent): void {
    const date = event.date.replaceAll('-', '');
    const content = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT', `DTSTART;VALUE=DATE:${date}`, `SUMMARY:${event.title}`, `LOCATION:${event.location}`, `DESCRIPTION:${event.description}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([content], { type: 'text/calendar' }));
    link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`;
    link.click();
    URL.revokeObjectURL(link.href);
  }
}
