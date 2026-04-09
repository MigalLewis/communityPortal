import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  quote: string;
  name: string;
  neighborhood: string;
  rating: number;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.scss'
})
export class TestimonialsComponent {
  @Input() testimonials: Testimonial[] = [];

  starsFor(rating: number): string {
    return '★'.repeat(Math.max(1, Math.min(rating, 5)));
  }
}
