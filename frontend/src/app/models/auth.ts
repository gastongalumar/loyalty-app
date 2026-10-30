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
  backgroundUrl?: string | null;
  backgroundVisibility?: number | null;
  backgroundBlur?: number | null;
  stampIcon?: string | null;
  rewardIcon?: string | null;
}
