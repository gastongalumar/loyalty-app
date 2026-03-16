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
  role: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userId: number;
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
  fidelityRewards: FidelityReward[];
}

export interface Stamp {
  id: number;
  addedByName: string;
  note: string;
  createdAt: string;
}

export interface Reward {
  id: number;
  description: string;
  status: 'AVAILABLE' | 'REDEEMED' | 'REQUESTED';
  earnedAt: string;
  redeemedAt?: string;
  requestedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface FidelityReward {
  id: number;
  description: string;
  status: 'AVAILABLE' | 'REDEEMED' | 'REQUESTED';
  earnedAt: string;
  redeemedAt?: string;
  requestedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  cardsRequired: number;
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
