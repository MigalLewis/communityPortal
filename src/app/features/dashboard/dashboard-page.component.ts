import { Component } from '@angular/core';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardContainerComponent } from '../../shared/ui/card-container/card-container.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [BadgeComponent, ButtonComponent, CardContainerComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss'
})
export class DashboardPageComponent {}
