import type { NextConfig } from 'next'

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'localhost:3000')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
}

export default nextConfig
