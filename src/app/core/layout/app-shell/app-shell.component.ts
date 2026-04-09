import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileDrawerComponent } from '../mobile-drawer/mobile-drawer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopBarComponent } from '../top-bar/top-bar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, MobileDrawerComponent, TopBarComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  protected readonly isDrawerOpen = signal(false);

  protected openDrawer(): void {
    this.isDrawerOpen.set(true);
  }

  protected closeDrawer(): void {
    this.isDrawerOpen.set(false);
  }
}
