/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  distDir: '.next',
  // Ensure static optimization
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['next/link']
  }
}

module.exports = nextConfig
