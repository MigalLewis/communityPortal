export interface AuthUser {
  id: string;
  email: string;
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}
