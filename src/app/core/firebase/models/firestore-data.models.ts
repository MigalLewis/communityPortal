import { UserRole } from '../../../features/auth/models/user-role.model';
import { UserAccountStatus } from '../../../features/auth/models/user-profile.model';

export type ISODateString = string;

export interface FirestoreEntity {
  id: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface UserDocument extends FirestoreEntity {
  fullName: string;
  email: string;
  role: UserRole;
  status: UserAccountStatus;
  approvedAt?: ISODateString;
  approvedBy?: string;
  deactivatedAt?: ISODateString;
  deactivatedBy?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ContractorDocument extends FirestoreEntity {
  userId: string;
  businessName: string;
  categoryIds: string[];
  serviceAreas: string[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  bio?: string;
}

export interface ServiceProviderDocument extends FirestoreEntity {
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  whatsappNumber?: string;
  area: string;
  suburb?: string;
  address?: string;
  categoryIds: string[];
  categoryNames?: string[];
  bio: string;
  tags: string[];
  notes?: string;
  website?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  availabilityStatus: 'available_today' | 'busy' | 'unavailable';
  profileImageUrl?: string;
  galleryUrls: string[];
  createdBy: string;
}

export interface CategoryDocument extends FirestoreEntity {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface ReviewDocument extends FirestoreEntity {
  jobId: string;
  contractorId: string;
  residentId: string;
  rating: number;
  title?: string;
  comment: string;
}

export type JobStatus = 'draft' | 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface JobDocument extends FirestoreEntity {
  residentId: string;
  contractorId?: string;
  categoryId: string;
  title: string;
  description: string;
  budget?: number;
  scheduledDate?: ISODateString;
  status: JobStatus;
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  content: string;
  sentAt: ISODateString;
  readBy: string[];
}

export interface MessageThreadDocument extends FirestoreEntity {
  participantIds: string[];
  jobId?: string;
  lastMessage?: ThreadMessage;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface VerificationDocument extends FirestoreEntity {
  contractorId: string;
  type: 'license' | 'insurance' | 'identity' | 'background_check';
  status: VerificationStatus;
  submittedAt: ISODateString;
  reviewedAt?: ISODateString;
  reviewerId?: string;
  notes?: string;
}

export interface CollectionModelMap {
  users: UserDocument;
  contractors: ContractorDocument;
  serviceProviders: ServiceProviderDocument;
  categories: CategoryDocument;
  reviews: ReviewDocument;
  jobs: JobDocument;
  messageThreads: MessageThreadDocument;
  verifications: VerificationDocument;
}

export type CollectionName = keyof CollectionModelMap;
