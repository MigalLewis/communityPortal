import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthUser } from '../auth/models/auth-user.model';
import { UserProfile } from '../auth/models/user-profile.model';
import { AuthService, ReauthenticationRequiredError } from '../auth/services/auth.service';
import { UserProfileService } from '../auth/services/user-profile.service';
import { SettingsPageComponent } from './settings-page.component';

describe('SettingsPageComponent', () => {
  let fixture: ComponentFixture<SettingsPageComponent>;
  let auth: jasmine.SpyObj<AuthService>;
  let profiles: jasmine.SpyObj<UserProfileService>;
  const user: AuthUser = { id: 'admin-1', email: 'admin@example.com', idToken: 'token', refreshToken: 'refresh', expiresAt: Date.now() + 10000, claims: { admin: true, paidResident: false } };
  const profile: UserProfile = { id: user.id, email: user.email, fullName: 'Ada Admin', phone: '123', role: 'admin', status: 'active', membershipStatus: 'none', createdAt: 'now', notificationPreferences: { email: true, communityUpdates: false } };

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['updatePassword', 'forgotPassword', 'logout'], { authUser: signal(user) });
    profiles = jasmine.createSpyObj<UserProfileService>('UserProfileService', ['updateAccountSettings'], { currentProfile: signal(profile) });
    auth.updatePassword.and.resolveTo(); auth.forgotPassword.and.resolveTo(); auth.logout.and.resolveTo();
    profiles.updateAccountSettings.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [SettingsPageComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: UserProfileService, useValue: profiles },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(SettingsPageComponent);
    fixture.detectChanges();
  });

  it('shows editable personal details and read-only authorization details', () => {
    const root = fixture.nativeElement as HTMLElement;
    expect((root.querySelector('#full-name') as HTMLInputElement).value).toBe('Ada Admin');
    expect(root.textContent).toContain('Role');
    expect(root.textContent).toContain('admin');
    expect(root.textContent).toContain('Account status');
    expect(root.querySelector('input[formcontrolname="role"]')).toBeNull();
  });

  it('validates and saves only account settings with success feedback', async () => {
    const component = fixture.componentInstance as any;
    component.profileForm.patchValue({ fullName: 'Ada Updated', phone: '456', emailNotifications: false });
    await component.saveProfile();
    fixture.detectChanges();
    expect(profiles.updateAccountSettings).toHaveBeenCalledWith(user, jasmine.objectContaining({
      fullName: 'Ada Updated', notificationPreferences: { email: false, communityUpdates: false }
    }));
    expect(fixture.nativeElement.querySelector('[role=status]').textContent).toContain('saved');

    component.profileForm.patchValue({ fullName: '' });
    await component.saveProfile();
    fixture.detectChanges();
    expect(profiles.updateAccountSettings).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('#full-name-error').textContent).toContain('full name');
  });

  it('reports request failures and reauthentication-required password changes', async () => {
    profiles.updateAccountSettings.and.rejectWith(new Error('Network unavailable'));
    await (fixture.componentInstance as any).saveProfile();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]').textContent).toContain('Network unavailable');

    auth.updatePassword.and.rejectWith(new ReauthenticationRequiredError());
    const component = fixture.componentInstance as any;
    component.passwordForm.setValue({ password: 'secret1', confirmPassword: 'secret1' });
    await component.changePassword();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('sign in again');
    expect(fixture.nativeElement.textContent).toContain('return here to retry');
  });

  it('supports password reset and a clear sign-out action', async () => {
    const component = fixture.componentInstance as any;
    await component.sendPasswordReset();
    expect(auth.forgotPassword).toHaveBeenCalledWith(user.email);
    await component.signOut();
    expect(auth.logout).toHaveBeenCalled();
    expect(TestBed.inject(Router).navigateByUrl).toHaveBeenCalledWith('/login');
  });
});
