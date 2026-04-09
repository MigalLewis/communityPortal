import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-welcome-hero',
  standalone: true,
  templateUrl: './welcome-hero.component.html',
  styleUrl: './welcome-hero.component.scss'
})
export class WelcomeHeroComponent {
  @Input() heading = 'Good morning, Resident.';
  @Input() copy = 'Your home is your sanctuary. Let’s find the right specialist to keep everything in perfect condition.';
}
