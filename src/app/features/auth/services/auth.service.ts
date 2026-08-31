import { Injectable, computed, signal } from '@angular/core';
import { firebaseClient } from '../../../core/firebase/firebase.client';
import { AuthUser } from '../models/auth-user.model';
import { PublicProfileRegistration, UserProfileService } from './user-profile.service';

export interface PublicRegistration extends PublicProfileRegistration {
  email: string;
  password: string;
}

export class ProfileOnboardingRequiredError extends Error {
  constructor() {
    super('Your account was created, but profile setup could not be completed. Please retry onboarding.');
    this.name = 'ProfileOnboardingRequiredError';
  }
}

interface FirebaseAuthResponse {
  localId: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'community-portal-auth-user';
  private readonly authUserSignal = signal<AuthUser | null>(this.readStoredAuthUser());
  private readonly stateSignal = signal<'loading' | 'ready'>('loading');
  private readyPromise: Promise<void>;

  readonly authUser = computed(() => this.authUserSignal());
  readonly initializationState = computed(() => this.stateSignal());
  readonly isAuthenticated = computed(() => {
    const user = this.authUserSignal();
    return !!user && user.expiresAt > Date.now();
  });

  constructor(private readonly userProfileService: UserProfileService) {
    this.readyPromise = this.initialize(this.authUserSignal());
  }

  private async initialize(user: AuthUser | null): Promise<void> {
    this.stateSignal.set('loading');
    try { await this.userProfileService.syncCurrentProfile(user); }
    finally { this.stateSignal.set('ready'); }
  }

  async waitUntilReady(): Promise<void> { await this.readyPromise; }

  async login(email: string, password: string): Promise<AuthUser> {
    const response = await this.callIdentityToolkit<FirebaseAuthResponse>('accounts:signInWithPassword', {
      email,
      password,
      returnSecureToken: true
    });

    return this.setAuthUser(response);
  }

  async register(registration: PublicRegistration): Promise<AuthUser> {
    const response = await this.callIdentityToolkit<FirebaseAuthResponse>('accounts:signUp', {
      email: registration.email,
      password: registration.password,
      returnSecureToken: true
    });

    const authUser = this.setAuthUser(response, false);
    const { email: _email, password: _password, ...profileRegistration } = registration;
    try {
      await this.userProfileService.createPublicProfile(authUser, profileRegistration);
    } catch {
      // Keep the authenticated user so the UI can route to a recoverable onboarding state.
      throw new ProfileOnboardingRequiredError();
    }
    return authUser;
  }

  async retryProfileCreation(registration: PublicRegistration): Promise<AuthUser> {
    const authUser = this.authUserSignal();
    if (!authUser) throw new Error('Please sign in to resume profile setup.');
    const { email: _email, password: _password, ...profileRegistration } = registration;
    await this.userProfileService.createPublicProfile(authUser, profileRegistration);
    return authUser;
  }

  async logout(): Promise<void> {
    this.authUserSignal.set(null);
    localStorage.removeItem(this.storageKey);
    this.userProfileService.clearCurrentProfile();
    this.stateSignal.set('ready');
    this.readyPromise = Promise.resolve();
  }

  async forgotPassword(email: string): Promise<void> {
    await this.callIdentityToolkit('accounts:sendOobCode', {
      requestType: 'PASSWORD_RESET',
      email
    });
  }

  private async callIdentityToolkit<TResponse>(path: string, payload: object): Promise<TResponse> {
    const response = await fetch(`${firebaseClient.identityBaseUrl}/${path}?key=${firebaseClient.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseBody = (await response.json()) as { error?: { message?: string } } & TResponse;

    if (!response.ok) {
      const errorCode = responseBody.error?.message;
      throw new Error(this.mapFirebaseAuthError(errorCode));
    }

    return responseBody;
  }

  private setAuthUser(response: FirebaseAuthResponse, syncProfile = true): AuthUser {
    const authUser: AuthUser = {
      id: response.localId,
      email: response.email,
      idToken: response.idToken,
      refreshToken: response.refreshToken,
      expiresAt: Date.now() + Number(response.expiresIn) * 1000,
      claims: this.readTrustedClaims(response.idToken)
    };

    this.authUserSignal.set(authUser);
    localStorage.setItem(this.storageKey, JSON.stringify(authUser));
    if (syncProfile) this.readyPromise = this.initialize(authUser);

    return authUser;
  }

  private readTrustedClaims(idToken: string): AuthUser['claims'] {
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as Record<string, unknown>;
      return { admin: payload['admin'] === true, paidResident: payload['paidResident'] === true };
    } catch {
      return { admin: false, paidResident: false };
    }
  }

  private readStoredAuthUser(): AuthUser | null {
    const raw =  localStorage.getItem(this.storageKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw) as AuthUser;
      parsed.claims = this.readTrustedClaims(parsed.idToken);
      return parsed.expiresAt > Date.now() ? parsed : null;
    } catch {
      return null;
    }
  }

  private mapFirebaseAuthError(errorCode?: string): string {
    switch (errorCode) {
      case 'INVALID_EMAIL':
        return 'Please enter a valid email address.';
      case 'EMAIL_NOT_FOUND':
      case 'INVALID_PASSWORD':
      case 'INVALID_LOGIN_CREDENTIALS':
        return 'Invalid email or password. Please try again.';
      case 'EMAIL_EXISTS':
        return 'An account already exists for this email. Please log in instead.';
      case 'WEAK_PASSWORD : Password should be at least 6 characters':
      case 'WEAK_PASSWORD':
        return 'Please choose a stronger password (at least 6 characters).';
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        return 'Too many attempts. Please wait a minute and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}
