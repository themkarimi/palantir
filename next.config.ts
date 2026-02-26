import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable standalone output for Docker (set DOCKER_OUTPUT=1 in build env)
  output: process.env.DOCKER_OUTPUT === '1' ? 'standalone' : undefined,
  // Allow <img> tags pointing to Simple Icons CDN (plain img, not next/image)
  // next/image would require listing all possible icon slug domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.simpleicons.org',
      },
    ],
  },
}

export default nextConfig
