/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        // Ưu tiên AVIF → WebP → fallback, giúp ảnh nhỏ hơn nhiều
        formats: ['image/avif', 'image/webp'],
        // Cache ảnh đã optimize 7 ngày
        minimumCacheTTL: 604800,
        deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
        imageSizes: [16, 32, 48, 64, 80, 96, 128, 256, 384],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'placehold.co',
            },
            {
                protocol: 'https',
                hostname: '*.hstatic.net',
            },
        ],
    },
};

module.exports = nextConfig;