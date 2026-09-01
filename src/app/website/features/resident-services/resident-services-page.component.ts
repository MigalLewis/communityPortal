import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-resident-services-page',
  standalone: true,
  templateUrl: './resident-services-page.component.html',
  styleUrl: './resident-services-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResidentServicesPageComponent {}
