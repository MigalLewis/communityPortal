import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProfileService } from '../auth/services/user-profile.service';
import { ADMIN_NAVIGATION } from './admin-navigation';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section aria-labelledby="admin-title">
      <div class="welcome">
        <span class="eyebrow">ADMINISTRATOR WORKSPACE</span>
        <h1 id="admin-title">Welcome back{{ profiles.currentProfile()?.fullName ? ', ' + profiles.currentProfile()?.fullName : '' }}.</h1>
        <p>Help keep your community connected. Manage accounts, maintain the directory and oversee community content from one place.</p>
        <a class="primary-action" routerLink="/admin/users">Manage users & applications <span aria-hidden="true">→</span></a>
      </div>
      <div class="tools-heading"><h2>Community management</h2><p>Choose an area to get started.</p></div>
      <div class="tools">
        @for (item of tools; track item.route) {
          <a class="tool" [routerLink]="item.route"><h3>{{ item.label }} <span aria-hidden="true">↗</span></h3><p>{{ item.description }}</p><span class="open-tool">Open {{ item.label.toLowerCase() }} →</span></a>
        }
      </div>
    </section>
  `,
  styleUrl: './admin-page.component.scss'
})
export class AdminPageComponent {
  protected readonly profiles = inject(UserProfileService);
  protected readonly tools = ADMIN_NAVIGATION.slice(1);
}
