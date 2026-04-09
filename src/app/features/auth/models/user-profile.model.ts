import { UserRole } from './user-role.model';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
