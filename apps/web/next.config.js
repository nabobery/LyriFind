/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['mcp-handler'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.genius.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.rapgenius.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.scdn.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        pathname: '/**',
      },
    ],
    // Fallback for unrecognized domains - use unoptimized images
    unoptimized: false,
  },
  // Vercel serverless function configuration
  serverExternalPackages: ['@modelcontextprotocol/sdk'],
}

module.exports = nextConfig
