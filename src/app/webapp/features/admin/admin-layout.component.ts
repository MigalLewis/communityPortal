import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ADMIN_NAVIGATION } from './admin-navigation';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="admin-layout">
      <aside class="admin-menu">
        <div class="menu-heading"><div><span class="eyebrow">COMMUNITY PORTAL</span><h2>Administration</h2></div>
          <button type="button" class="menu-toggle" (click)="menuOpen.set(!menuOpen())" [attr.aria-expanded]="menuOpen()" aria-controls="admin-navigation">Menu</button>
        </div>
        <nav id="admin-navigation" aria-label="Administration" [class.is-open]="menuOpen()">
          @for (item of navigation; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="is-active" [routerLinkActiveOptions]="{ exact: item.route !== '/admin/adverts' }" ariaCurrentWhenActive="page" (click)="menuOpen.set(false)">{{ item.label }}</a>
          }
          <a class="community-link" routerLink="/dashboard">← Community dashboard</a>
        </nav>
      </aside>
      <div class="admin-content"><router-outlet /></div>
    </div>
  `,
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  protected readonly navigation = ADMIN_NAVIGATION;
  protected readonly menuOpen = signal(false);
}
