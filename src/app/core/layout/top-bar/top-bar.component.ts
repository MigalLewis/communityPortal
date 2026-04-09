import { Component, EventEmitter, Output } from '@angular/core';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [BadgeComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss'
})
export class TopBarComponent {
  @Output() menuClicked = new EventEmitter<void>();

  protected openMenu(): void {
    this.menuClicked.emit();
  }
}
