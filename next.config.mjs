/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(process.env.APP_ENV === 'staging' || process.env.APP_ENV === 'production'
        ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }]
        : []),
      ...(process.env.APP_ENV === 'staging'
        ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' }]
        : []),
    ];

    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
