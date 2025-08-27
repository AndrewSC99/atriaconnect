/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      enabled: true,
    },
  },
  
  // Configurações de produção
  compress: true,
  
  // Headers de segurança
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
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      }
    ]
  },

  // Configurações de imagens
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Otimizações de bundle
  webpack: (config, { dev, isServer }) => {
    // Otimizações para produção
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              enforce: true,
            },
          },
        },
      }
    }

    return config
  },

  // Configurações de output
  output: 'standalone',
  
  // Variáveis de ambiente públicas
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version || '1.0.0',
    NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
  },

  // Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: true
  },

  // Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: true
  },

  // Redirects e rewrites
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: false
      }
    ]
  },


  // Pacotes externos do servidor
  serverExternalPackages: ['@prisma/client'],
  
  // Configurações experimentais para produção
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Configurações de cache
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Configurações de PoweredBy
  poweredByHeader: false,

  // Configurações de trailing slash
  trailingSlash: false,

  // Configurações de compilação
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

module.exports = nextConfig