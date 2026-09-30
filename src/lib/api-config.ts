/**
 * Trả về URL API phù hợp:
 * - Khi chạy ở phía server (Node.js/Docker/SSR/Server Components):
 *   Ưu tiên INTERNAL_API_URL hoặc http://backend:3002/api trong môi trường production Docker.
 * - Khi chạy ở phía client (Browser):
 *   Dùng NEXT_PUBLIC_API_URL hoặc http://localhost:3002/api.
 */
export function getApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return (
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:3002/api"
    );
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";
}
