/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/favicon.svg' }];
  },
  eslint: {
    // Les warnings d'apostrophes FR en JSX ne bloquent pas le POC
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      // Photos profil et logos clubs hébergés sur Scaleway / S3 — à compléter
      // { protocol: 'https', hostname: 'XXX.s3.fr-par.scw.cloud' },
    ],
  },
};

module.exports = nextConfig;
