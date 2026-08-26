import { fetchWithAuth } from '@/src/lib/api-client';
import { Coupon, CouponValidationResult } from '../types/coupon.types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export async function getAvailableCoupons(subtotal: number = 0): Promise<Coupon[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isRealToken = token && token !== 'session_active';
    const res = await fetchWithAuth(`${API_BASE}/coupons/available?subtotal=${subtotal}`, {
      cache: 'no-store',
      headers: {
        ...(isRealToken ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || json;
  } catch (error) {
    console.error('Failed to fetch available coupons:', error);
    return [];
  }
}

export async function validateCoupon(
  code: string,
  orderSubtotal: number
): Promise<CouponValidationResult> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const isRealToken = token && token !== 'session_active';

  const res = await fetchWithAuth(`${API_BASE}/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(isRealToken ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ code, orderSubtotal }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Không thể kiểm tra mã giảm giá.');
  }

  const json = await res.json();
  const data = json.data || json;
  return {
    ...data,
    message: json.message || data?.message,
  };
}
