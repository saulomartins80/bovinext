/** @type {import('next').NextConfig} */
import crypto from 'crypto';

const nextConfig = {
  // ✅ CORREÇÃO: Removido output: 'export' para permitir API routes e middleware
  trailingSlash: true,
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logoeps.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'logos-world.net',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    // Otimizações para mobile
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 ano
  },
  experimental: {
    optimizeCss: false,
    scrollRestoration: true,
    esmExternals: true,
  },
  
  // ✅ CORREÇÃO: Movido para fora do experimental no Next.js 15
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  
  // ✅ CORREÇÃO: Configurações de webpack para melhorar performance mobile
  webpack: (config, { dev, isServer, dir }) => {
    if (dev && !isServer) {
      // Otimizar HMR
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
      
      // Melhorar performance do HMR
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Criar chunks separados para melhor HMR
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }
    
    // Otimizações para produção - Bundle splitting agressivo
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: false,
            vendors: false,
            
            // Framework chunk (React, Next.js) - crítico
            framework: {
              chunks: 'all',
              name: 'framework',
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            
            // Firebase chunk separado - lazy load
            firebase: {
              name: 'firebase',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
              priority: 35,
              enforce: true,
            },
            
            // Stripe chunk separado - lazy load
            stripe: {
              name: 'stripe',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](@stripe|stripe)[\\/]/,
              priority: 30,
              enforce: true,
            },
            
            // Framer Motion chunk separado
            framer: {
              name: 'framer',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](framer-motion)[\\/]/,
              priority: 28,
              enforce: true,
            },
            
            // React Icons chunk separado
            icons: {
              name: 'icons',
              chunks: 'async',
              test: /[\\/]node_modules[\\/](react-icons)[\\/]/,
              priority: 26,
              enforce: true,
            },
            
            // Vendor libraries grandes
            lib: {
              test(module) {
                return module.size() > 160000 && /node_modules[/\\]/.test(module.identifier());
              },
              name(module) {
                const hash = crypto.createHash('sha1');
                hash.update(module.libIdent ? module.libIdent({ context: dir }) : module.identifier());
                return hash.digest('hex').substring(0, 8);
              },
              priority: 25,
              minChunks: 1,
              reuseExistingChunk: true,
              chunks: 'async',
            },
            
            // Common chunks
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 20,
              chunks: 'initial',
              reuseExistingChunk: true,
            },
            
            // Shared chunks
            shared: {
              name: 'shared',
              chunks: 'all',
              minChunks: 2,
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
        
        // Otimizações adicionais
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
      };
    }
    
    // Otimizações gerais
    config.resolve.alias = {
      ...config.resolve.alias,
      // Reduzir bundle size
      'react/jsx-runtime': 'react/jsx-runtime',
    };
    
    return config;
  },
  
  // ✅ CORREÇÃO: Configurações de compressão
  compress: true,
  
  // ✅ CORREÇÃO: Configurações de produção
  productionBrowserSourceMaps: false,
  
  // ✅ CORREÇÃO: Configurações de TypeScript
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // ✅ CORREÇÃO: Configurações de ESLint
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'development',
  },
  
  // ✅ CORREÇÃO: Configurações de trailing slash
  trailingSlash: false,
  
  // ✅ CORREÇÃO: Configurações de powered by header
  poweredByHeader: false,
  
  // ✅ ADICIONADO: Headers de performance e cache otimizado
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*\\.(ico|png|jpg|jpeg|webp|avif|svg|gif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;