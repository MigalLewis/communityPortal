export interface AuthUser {
  id: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  /** Privileges asserted by Firebase Auth, never by the editable profile document. */
  claims: AuthClaims;
}

export interface AuthClaims {
  admin: boolean;
  paidResident: boolean;
}
