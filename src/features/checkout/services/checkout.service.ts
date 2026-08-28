import { apiClient } from '@/src/lib/api-client';
import type {
  CheckoutEstimateDto,
  CheckoutEstimateResponse,
} from '../types/checkout-estimate.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface ShippingFeeOption {
  providerId: string;
  providerName: string;
  serviceName: string;
  fee: number;
  expectedDeliveryDate: string;
  description?: string;
}

export async function estimateCheckout(
  dto: CheckoutEstimateDto = {}
): Promise<CheckoutEstimateResponse> {
  const res = await apiClient<ApiResponse<CheckoutEstimateResponse>>(
    '/orders/estimate',
    {
      method: 'POST',
      body: JSON.stringify(dto),
    }
  );
  return res.data;
}

export async function fetchShippingOptions(params: {
  locationId?: string;
  provinceName?: string;
  districtName?: string;
  wardName?: string;
  subtotal?: number;
}): Promise<ShippingFeeOption[]> {
  try {
    const res = await apiClient<{ success: boolean; message: string; data: { success: boolean; options: ShippingFeeOption[] } }>(
      '/shipping/calculate-fee',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    return res.data?.options || [];
  } catch (err) {
    console.error('Failed to fetch shipping options:', err);
    return [];
  }
}
