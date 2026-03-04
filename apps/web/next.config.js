/** @type {import('next').NextConfig} */
const isDesktop = process.env.BUILD_TARGET === 'desktop';

const nextConfig = {
  // Desktop mode: static export for Tauri
  output: isDesktop ? 'export' : undefined,
  images: {
    unoptimized: isDesktop,
    remotePatterns: isDesktop
      ? []
      : [
          // Tencent COS (image CDN)
          {
            protocol: 'https',
            hostname: '*.myqcloud.com',
          },
          // Tencent VOD thumbnails
          {
            protocol: 'https',
            hostname: '*.vod2.myqcloud.com',
          },
        ],
  },
  // Allow importing from workspace packages
  transpilePackages: ['@workspace/ui', '@workspace/types'],
};

module.exports = nextConfig;
