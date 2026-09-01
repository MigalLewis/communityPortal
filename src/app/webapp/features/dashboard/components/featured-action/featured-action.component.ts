import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-featured-action',
  standalone: true,
  templateUrl: './featured-action.component.html',
  styleUrl: './featured-action.component.scss'
})
export class FeaturedActionComponent {
  @Input() title = 'Need a custom Home Check-up?';
  @Input() copy = 'A comprehensive 50-point inspection to catch issues before they become expensive repairs.';
  @Input() cta = 'Book Check-up';
}
