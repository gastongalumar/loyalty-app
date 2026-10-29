export type Role = 'PLATFORM_ADMIN' | 'BUSINESS_ADMIN' | 'CUSTOMER';

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  /** Only CUSTOMER is accepted. Kept optional so the UI never sends it. */
  role?: 'CUSTOMER';
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  userId: number;
  tenantId?: number | null;
  tenantSlug?: string | null;
}

export interface TenantInfo {
  slug: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED';
  colorPrimary?: string | null;
  colorSecondary?: string | null;
  logoUrl?: string | null;
}

export interface Business {
  id: number;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  stampsRequired: number;
  rewardDescription: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  ownerId?: number;
  totalCustomers: number;
  totalAdmins: number;
  createdAt: string;
}

export interface BusinessSummary {
  id: number;
  slug: string;
  name: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  totalCustomers: number;
  createdAt: string;
}

export interface Admin {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}

export interface LoyaltyCard {
  id: number;
  userId: number;
  customerName: string;
  customerEmail: string;
  qrCode: string;
  businessName: string;
  rewardDescription: string;
  currentStamps: number;
  totalStamps: number;
  completedCards: number;
  status: 'ACTIVE' | 'COMPLETED' | 'REWARD_PENDING';
  createdAt: string;
  updatedAt: string;
  recentStamps: Stamp[];
  rewards: Reward[];
}

export interface Stamp {
  id: number;
  addedByName: string;
  note?: string;
  createdAt: string;
}

export interface Reward {
  id: number;
  cardId?: number;
  customerName?: string;
  description: string;
  status: 'AVAILABLE' | 'REDEEMED';
  earnedAt: string;
  redeemedAt?: string;
  redeemedBy?: string;
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  qrCode: string;
  currentStamps: number;
  totalStamps: number;
  completedCards: number;
  cardStatus: string;
  memberSince: string;
}

export interface AddStampRequest {
  userId: number;
  note?: string;
}

export interface ScanQrRequest {
  qrCode: string;
  note?: string;
}
