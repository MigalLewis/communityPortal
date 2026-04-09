import { Component } from '@angular/core';
import { CardContainerComponent } from '../../shared/ui/card-container/card-container.component';

@Component({
  selector: 'app-work-orders-page',
  standalone: true,
  imports: [CardContainerComponent],
  templateUrl: './work-orders-page.component.html'
})
export class WorkOrdersPageComponent {}
