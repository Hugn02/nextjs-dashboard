import { apiClient } from '@/src/lib/api-client';
import type {
  Province,
  District,
  Ward,
  UserLocation,
  CreateUserLocationDto,
  UpdateUserLocationDto,
} from '../types/location.types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

// ─── Administrative Location APIs (public) ────────────────────────────────────

export async function getProvinces(): Promise<Province[]> {
  const res = await apiClient<ApiResponse<Province[]>>('/provinces');
  return res.data;
}

export async function getDistricts(provinceCode: string): Promise<District[]> {
  const res = await apiClient<ApiResponse<District[]>>(
    `/provinces/${provinceCode}/districts`
  );
  return res.data;
}

export async function getWards(districtCode: string): Promise<Ward[]> {
  const res = await apiClient<ApiResponse<Ward[]>>(
    `/districts/${districtCode}/wards`
  );
  return res.data;
}

// ─── Helper ──────────────────────────────────────────────────────────────────
/**
 * Backend dùng applyMongooseSerialization: xóa _id, thêm id (string).
 * Hàm này đảm bảo cả `id` lẫn `_id` đều có giá trị string đúng.
 */
function normalizeLocation(loc: UserLocation): UserLocation {
  // BE trả về `id`, không có `_id`
  const rawId = (loc as any).id ?? (loc as any)._id ?? '';
  const id = String(rawId);
  return { ...loc, id, _id: id };
}

// ─── User Location APIs (require JWT auth via httpOnly cookie) ────────────────

export async function getUserLocations(): Promise<UserLocation[]> {
  const res = await apiClient<ApiResponse<UserLocation[]>>('/user-locations');
  return res.data.map(normalizeLocation);
}

export async function getDefaultLocation(): Promise<UserLocation | null> {
  const res = await apiClient<ApiResponse<UserLocation | null>>(
    '/user-locations/default'
  );
  return res.data ? normalizeLocation(res.data) : null;
}

export async function createUserLocation(
  dto: CreateUserLocationDto
): Promise<UserLocation> {
  const res = await apiClient<ApiResponse<UserLocation>>('/user-locations', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return normalizeLocation(res.data);
}

export async function updateUserLocation(
  id: string,
  dto: UpdateUserLocationDto
): Promise<UserLocation> {
  const res = await apiClient<ApiResponse<UserLocation>>(
    `/user-locations/${id}`,
    {
      method: 'PATCH',
      body: JSON.stringify(dto),
    }
  );
  return normalizeLocation(res.data);
}

export async function deleteUserLocation(id: string): Promise<void> {
  await apiClient<ApiResponse<boolean>>(`/user-locations/${id}`, {
    method: 'DELETE',
  });
}

export async function setDefaultLocation(id: string): Promise<UserLocation> {
  const res = await apiClient<ApiResponse<UserLocation>>(
    `/user-locations/${id}/default`,
    { method: 'PATCH' }
  );
  return normalizeLocation(res.data);
}
