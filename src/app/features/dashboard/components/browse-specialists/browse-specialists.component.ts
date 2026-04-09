import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Specialist {
  name: string;
  role: string;
  tags: string[];
  rating: string;
  availability: string;
  image: string;
}

@Component({
  selector: 'app-browse-specialists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './browse-specialists.component.html',
  styleUrl: './browse-specialists.component.scss'
})
export class BrowseSpecialistsComponent {
  @Input() specialists: Specialist[] = [];
}
