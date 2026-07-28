/**
 * Cloudinary image utilities - Dùng chung cho toàn dự án
 * Tự động đọc base URL từ biến môi trường NEXT_PUBLIC_IMAGE_BASE_URL
 *
 * Lưu ý: Dùng f_auto:webp thay vì f_auto để tránh AVIF encoding chậm lần đầu.
 * WebP vừa đủ nhỏ, decode nhanh hơn AVIF và được hỗ trợ rộng rãi (>95% browser).
 */

export const getCloudinaryBase = (): string => {
  const envBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, "");
  return "https://res.cloudinary.com/dls9re0ux/image/upload";
};

/**
 * Next.js image loader — tự chèn width + chất lượng + WebP vào URL Cloudinary.
 * Cloudinary resize và convert sang WebP ngay trên CDN, cache lại cho các request sau.
 */
export function cloudinaryLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src.includes("res.cloudinary.com")) return src;
  const q = quality ?? 80;
  if (src.includes("/upload/")) {
    if (src.includes("/w_") || src.includes("/q_")) return src;
    // f_auto:webp → chỉ dùng WebP (không fallback sang AVIF chậm)
    return src.replace(/\/upload\//, `/upload/w_${width},q_${q},f_auto:webp,c_limit/`);
  }
  return src;
}

/**
 * Format URL Cloudinary thêm transform w, q, WebP.
 * Tự động đọc base URL từ NEXT_PUBLIC_IMAGE_BASE_URL trong .env.local hoặc Vercel Environment Variables.
 */
export function formatCloudinaryUrl(
  url?: string,
  opts: { width?: number; quality?: number } = {}
): string {
  if (!url) return "https://placehold.co/400x400";
  const { width = 800, quality = 80 } = opts;

  if (url.includes("res.cloudinary.com/") && url.includes("/upload/")) {
    if (url.includes("/w_") || url.includes("/q_")) return url;
    return url.replace(/\/upload\//, `/upload/w_${width},q_${quality},f_auto:webp,c_limit/`);
  }

  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
    const base = getCloudinaryBase();
    return `${base}/w_${width},q_${quality},f_auto:webp,c_limit/${url.replace(/^\/+/, "")}`;
  }

  return url;
}

export const formatImageUrl = formatCloudinaryUrl;

