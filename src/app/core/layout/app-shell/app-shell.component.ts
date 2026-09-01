import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, TopBarComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  private readonly router = inject(Router);

  protected get isLandingPage(): boolean {
    return this.router.url === '/' || this.router.url.startsWith('/?');
  }
}
