/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async redirects() { return [{source:'/privacy/',destination:'/privacy-policy/',permanent:true}]; },
  images: { formats: ['image/avif', 'image/webp'] },
  async headers() { return [{ source: '/:path*', headers: [
    {key:'X-Content-Type-Options',value:'nosniff'}, {key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},
    {key:'X-Frame-Options',value:'DENY'}, {key:'Permissions-Policy',value:'camera=(), microphone=(), geolocation=()'},
    {key:'Content-Security-Policy',value:"frame-ancestors 'none'; object-src 'self'; base-uri 'self'; form-action 'self'"}
  ]}]; },
  experimental: { serverActions: { bodySizeLimit: '2mb' } },
};
export default nextConfig;
