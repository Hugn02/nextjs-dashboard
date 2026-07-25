export enum CheckoutItemStatus {
  VALID = 'VALID',
  PRICE_CHANGED = 'PRICE_CHANGED',
  PRODUCT_REMOVED = 'PRODUCT_REMOVED',
  PRODUCT_INACTIVE = 'PRODUCT_INACTIVE',
  VARIANT_UNAVAILABLE = 'VARIANT_UNAVAILABLE',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
}

export interface CheckoutItemIssueResponse {
  code: CheckoutItemStatus;
  message: string;
  oldValue?: number;
  newValue?: number;
  requestedQuantity?: number;
  availableQuantity?: number;
}

export interface CheckoutEstimateItemResponse {
  productId: string;
  productName: string;
  image: string;
  sku?: string;
  variant: string | null;
  quantity: number;
  availableQuantity: number;
  oldPrice: number;
  currentPrice: number;
  subtotal: number;
  status: CheckoutItemStatus;
  issues: CheckoutItemIssueResponse[];
}

export interface CheckoutPricingResponse {
  subtotal: number;
  promotionDiscount: number;
  voucherDiscount: number;
  shippingFee: number;
  tax: number;
  total: number;
}

export interface CheckoutEstimateSummaryResponse {
  totalItems: number;
  validItems: number;
  invalidItems: number;
  priceChangedItems: number;
  outOfStockItems: number;
  inactiveItems: number;
}

export interface CheckoutEstimateResponse {
  canCheckout: boolean;
  summary: CheckoutEstimateSummaryResponse;
  items: CheckoutEstimateItemResponse[];
  pricing: CheckoutPricingResponse;
}

export interface CheckoutEstimateDto {
  addressId?: string;
  voucherId?: string;
  paymentMethod?: string;
}
