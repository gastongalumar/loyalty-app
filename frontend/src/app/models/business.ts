export interface Business {
  id: number;
  slug: string;
  name: string;
  description?: string;
  logoUrl?: string;
  backgroundUrl?: string;
  colorPrimary?: string;
  colorSecondary?: string;
  stampIcon?: string;
  rewardIcon?: string;
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
