import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserProfileService } from '../services/user-profile.service';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `<main class="status-page"><h1>{{ title }}</h1><p>{{ message }}</p>@if (!profile()) {<button [disabled]="retrying()" (click)="retry()">Retry loading profile</button>}<a routerLink="/help">Contact support</a></main>`,
  styles: [`.status-page{max-width:42rem;margin:6rem auto;padding:2rem;text-align:center}a{display:inline-block;margin-top:1rem}`]
})
export class AccountStatusPageComponent {
  private readonly profiles = inject(UserProfileService);
  protected readonly profile = this.profiles.currentProfile;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly retrying = signal(false);
  get title(): string { return !this.profile() ? 'Account profile unavailable' : this.profile()?.status === 'rejected' ? 'Account application rejected' : this.profile()?.status === 'deactivated' ? 'Account deactivated' : this.profile()?.status === 'active' ? 'Account active' : 'Account approval pending'; }
  get message(): string { return !this.profile() ? this.profiles.profileLoadError() ?? 'Your account profile is unavailable. Please retry or contact support.' : this.profile()?.status === 'rejected' ? 'Your application was not approved.' : this.profile()?.status === 'deactivated' ? 'This account no longer has access.' : this.profile()?.status === 'active' ? 'Your account is active.' : 'We are reviewing your account. Please check back later.'; }

  protected async retry(): Promise<void> {
    if (this.retrying()) return;
    this.retrying.set(true);
    try {
      await this.auth.waitUntilReady();
      if (!this.auth.isAuthenticated()) {
        await this.router.navigateByUrl('/login');
        return;
      }
      await this.profiles.syncCurrentProfile(this.auth.authUser());
      if (this.profile()) {
        const destination = this.route.snapshot.queryParamMap.get('redirectTo');
        await this.router.navigateByUrl(destination?.startsWith('/') && !destination.startsWith('//') ? destination : '/dashboard');
      }
    } finally {
      this.retrying.set(false);
    }
  }
}
