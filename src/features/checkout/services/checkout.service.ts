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

export async function estimateCheckout(
  dto: CheckoutEstimateDto = {}
): Promise<CheckoutEstimateResponse> {
  const res = await apiClient<ApiResponse<CheckoutEstimateResponse>>(
    '/checkout/estimate',
    {
      method: 'POST',
      body: JSON.stringify(dto),
    }
  );
  return res.data;
}
