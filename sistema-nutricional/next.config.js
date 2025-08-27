/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build configs
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  
  // Output standalone para deploy
  output: 'standalone',
  
  // Pacotes externos
  serverExternalPackages: ['@prisma/client', 'nodemailer', 'speakeasy', 'qrcode', 'bcrypt'],
  
  // Configurações de imagem
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Configurações básicas de segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  },

  // Redirects removidos - landing page será a inicial

  // Desabilitar powered by
  poweredByHeader: false,
}

module.exports = nextConfig