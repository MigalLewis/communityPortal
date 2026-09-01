import { Component } from '@angular/core';
import { CardContainerComponent } from '../../../shared/ui/card-container/card-container.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [CardContainerComponent],
  templateUrl: './settings-page.component.html'
})
export class SettingsPageComponent {}
