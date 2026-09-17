import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CardContainerComponent } from '../../../shared/ui/card-container/card-container.component';
import { ReauthenticationRequiredError, AuthService } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [ReactiveFormsModule, CardContainerComponent],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.scss'
})
export class SettingsPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(UserProfileService);
  private readonly router = inject(Router);
  protected readonly profile = this.profiles.currentProfile;
  protected readonly savingProfile = signal(false);
  protected readonly changingPassword = signal(false);
  protected readonly sendingReset = signal(false);
  protected readonly profileSuccess = signal<string | null>(null);
  protected readonly profileError = signal<string | null>(null);
  protected readonly passwordSuccess = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly reauthenticationRequired = signal(false);

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(120)]],
    phone: ['', [Validators.maxLength(30)]],
    emailNotifications: true,
    communityUpdates: true
  });
  protected readonly passwordForm = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  ngOnInit(): void {
    const profile = this.profile();
    if (!profile) return;
    this.profileForm.reset({
      fullName: profile.fullName,
      phone: profile.phone ?? '',
      emailNotifications: profile.notificationPreferences?.email ?? true,
      communityUpdates: profile.notificationPreferences?.communityUpdates ?? true
    });
  }

  protected async saveProfile(): Promise<void> {
    if (this.profileForm.invalid || this.savingProfile()) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const user = this.auth.authUser();
    if (!user) return;
    this.profileError.set(null);
    this.profileSuccess.set(null);
    this.savingProfile.set(true);
    const value = this.profileForm.getRawValue();
    try {
      await this.profiles.updateAccountSettings(user, {
        fullName: value.fullName,
        phone: value.phone,
        notificationPreferences: { email: value.emailNotifications, communityUpdates: value.communityUpdates }
      });
      this.profileSuccess.set('Your account settings have been saved.');
      this.profileForm.markAsPristine();
    } catch (error) {
      this.profileError.set(this.message(error, 'We could not save your account settings. Please try again.'));
    } finally {
      this.savingProfile.set(false);
    }
  }

  protected async changePassword(): Promise<void> {
    const { password, confirmPassword } = this.passwordForm.getRawValue();
    if (this.passwordForm.invalid || password !== confirmPassword || this.changingPassword()) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.reauthenticationRequired.set(false);
    this.changingPassword.set(true);
    try {
      await this.auth.updatePassword(password);
      this.passwordSuccess.set('Your password has been changed.');
      this.passwordForm.reset();
    } catch (error) {
      this.reauthenticationRequired.set(error instanceof ReauthenticationRequiredError);
      this.passwordError.set(this.message(error, 'We could not change your password. Please try again.'));
    } finally {
      this.changingPassword.set(false);
    }
  }

  protected async sendPasswordReset(): Promise<void> {
    const email = this.auth.authUser()?.email;
    if (!email || this.sendingReset()) return;
    this.passwordError.set(null);
    this.passwordSuccess.set(null);
    this.sendingReset.set(true);
    try {
      await this.auth.forgotPassword(email);
      this.passwordSuccess.set(`Password reset instructions were sent to ${email}.`);
    } catch (error) {
      this.passwordError.set(this.message(error, 'We could not send password reset instructions. Please try again.'));
    } finally {
      this.sendingReset.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  private message(error: unknown, fallback: string): string {
    return error instanceof Error ? error.message : fallback;
  }
}
