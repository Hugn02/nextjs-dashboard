/**
 * Cloudinary image utilities - Dùng chung cho toàn dự án
 * Tự động đọc base URL từ biến môi trường NEXT_PUBLIC_IMAGE_BASE_URL
 */

export const getCloudinaryBase = (): string => {
  const envBase = process.env.NEXT_PUBLIC_IMAGE_BASE_URL;
  if (envBase) return envBase.replace(/\/+$/, "");
  return "https://res.cloudinary.com/dls9re0ux/image/upload";
};

/**
 * Next.js image loader - tự chèn width + q_auto + f_auto vào URL Cloudinary.
 * Cloudinary sẽ resize và convert format (WebP/AVIF) trực tiếp trên CDN.
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
    return src.replace(/\/upload\//, `/upload/w_${width},q_${q},f_auto,c_limit/`);
  }
  return src;
}

/**
 * Format URL Cloudinary thêm transform w, q, f_auto.
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
    return url.replace(/\/upload\//, `/upload/w_${width},q_${quality},f_auto,c_limit/`);
  }

  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("/")) {
    const base = getCloudinaryBase();
    return `${base}/w_${width},q_${quality},f_auto,c_limit/${url.replace(/^\/+/, "")}`;
  }

  return url;
}

export const formatImageUrl = formatCloudinaryUrl;

