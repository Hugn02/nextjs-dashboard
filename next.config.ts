import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: false, // Tắt strict mode để tránh double-mount useEffect trong dev
  images: {
    // Ưu tiên AVIF → WebP → fallback, giúp ảnh nhỏ hơn nhiều
    formats: ["image/avif", "image/webp"],
    // Cache ảnh đã optimize lâu hơn (7 ngày thay vì 60s default)
    minimumCacheTTL: 604800,
    // Kích thước breakpoints phù hợp với layout
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 80, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dls9re0ux/**",
      },
      {
        protocol: "https",
        hostname: "file.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
};

export default bundleAnalyzer(nextConfig);
