import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TrustPoint {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-trust-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trust-section.component.html',
  styleUrl: './trust-section.component.scss'
})
export class TrustSectionComponent {
  @Input() title = 'Trust is our foundation';
  @Input() copy = 'Every specialist is background-checked and reviewed by residents in your community.';
  @Input() points: TrustPoint[] = [];
}
