/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  // Replace 'paws-preferences' with your actual repository name
  basePath: process.env.NODE_ENV === 'production' ? '/paws_and_preferences' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/paws_and_preferences/' : '',
}

export default nextConfig