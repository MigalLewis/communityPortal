import { Component } from '@angular/core';
import { CardContainerComponent } from '../../../shared/ui/card-container/card-container.component';

@Component({
  selector: 'app-projects-page',
  standalone: true,
  imports: [CardContainerComponent],
  templateUrl: './projects-page.component.html'
})
export class ProjectsPageComponent {}
