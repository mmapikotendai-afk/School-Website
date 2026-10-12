/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};
export default nextConfig;
