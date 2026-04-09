import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-container',
  standalone: true,
  templateUrl: './card-container.component.html',
  styleUrl: './card-container.component.scss'
})
export class CardContainerComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
