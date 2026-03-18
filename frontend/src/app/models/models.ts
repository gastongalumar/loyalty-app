// frontend/src/app/models/models.ts
// ✅ BUG FIX #4: Added FidelityReward interface and missing fields to LoyaltyCard.
// Previously the Angular model had no FidelityReward type, so the rewards array
// arriving from the backend was discarded by the HttpClient type-cast.

export interface Stamp {
  id: number;
  note: string;
  addedBy: string;
  createdAt: string;
}

export interface Reward {
  id: number;
  description: string;
  status: 'AVAILABLE' | 'REQUESTED' | 'REDEEMED' | 'REJECTED';
  earnedAt: string;
  redeemedAt?: string;
}

/** ✅ NEW — mirrors LoyaltyCardDto.FidelityRewardDto */
export interface FidelityReward {
  id: number;
  description: string;
  /** AVAILABLE = can be requested; REQUESTED = pending admin approval; REDEEMED = used */
  status: 'AVAILABLE' | 'REQUESTED' | 'REDEEMED' | 'REJECTED';
  /** Completed-card count required to earn this reward (from FidelityTier) */
  cardsRequired: number;
  earnedAt: string;
  redeemedAt?: string;
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
  status: 'ACTIVE' | 'REWARD_PENDING' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
  recentStamps: Stamp[];
  rewards: Reward[];

  // ✅ BUG FIX #4: These three were missing — they caused fidelityRewards
  // to be inferred as `any[]` (and never rendered) and bonus bar had no data.
  fidelityRewards: FidelityReward[];
  bonusProgressPercent?: number;    // 0-100, towards next fidelity tier
  nextBonusDescription?: string;    // e.g. "Free coffee"
  nextBonusCardsRequired?: number;  // e.g. 5
}

export interface Customer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  qrCode?: string;
  currentStamps?: number;
  totalStamps?: number;
  completedCards?: number;
  cardStatus?: string;
  memberSince?: string;
}

export interface AddStampRequest {
  userId: number;
  note?: string;
}

export interface ScanQrRequest {
  qrCode: string;
  note?: string;
}
