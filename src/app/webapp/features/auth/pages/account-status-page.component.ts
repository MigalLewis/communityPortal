import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<main class="status-page"><h1>{{ title }}</h1><p>{{ message }}</p><a routerLink="/help">Contact support</a></main>`,
  styles: [`.status-page{max-width:42rem;margin:6rem auto;padding:2rem;text-align:center}a{display:inline-block;margin-top:1rem}`]
})
export class AccountStatusPageComponent {
  private readonly profile = inject(UserProfileService).currentProfile;
  get title(): string { return this.profile()?.status === 'rejected' ? 'Account application rejected' : this.profile()?.status === 'deactivated' ? 'Account deactivated' : 'Account approval pending'; }
  get message(): string { return this.profile()?.status === 'rejected' ? 'Your application was not approved.' : this.profile()?.status === 'deactivated' ? 'This account no longer has access.' : 'We are reviewing your account. Please check back later.'; }
}
