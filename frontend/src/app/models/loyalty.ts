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
