export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
}

export interface Coupon {
  id?: string;
  _id?: string;
  code: string;
  title: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number | null;
  minOrderValue: number;
  usageLimit?: number | null;
  usedCount: number;
  userUsageLimit: number;
  currentUserUsageCount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface CouponValidationResult {
  valid: boolean;
  message?: string;
  coupon?: Coupon;
  discountAmount: number;
  finalSubtotal: number;
}
