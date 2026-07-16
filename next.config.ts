import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  images: {
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
