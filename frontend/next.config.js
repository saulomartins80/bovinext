/** @type {import('next').NextConfig} */
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  // ✅ CORREÇÃO: Removido output: 'export' para permitir API routes e middleware
  trailingSlash: true,
  
  // Environment variables para produção
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
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
    optimizeCss: process.env.NODE_ENV === 'production',
    scrollRestoration: true,
    esmExternals: true,
    forceSwcTransforms: true,
  },
  
  // ✅ CORREÇÃO: Configuração otimizada para desenvolvimento
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 60 * 1000, // 1 minuto
      pagesBufferLength: 5,
    },
    // Desabilitar Fast Refresh para evitar loops infinitos
    reactStrictMode: false,
  }),
  
  // ✅ CORREÇÃO: Desabilitar Fast Refresh completamente
  ...(process.env.FAST_REFRESH === 'false' && {
    experimental: {
      ...((process.env.NODE_ENV === 'development') && {
        optimizeCss: false,
        scrollRestoration: true,
        esmExternals: true,
        forceSwcTransforms: true,
      }),
    },
  }),
  
  // ✅ CORREÇÃO: Movido para fora do experimental no Next.js 15
  serverExternalPackages: ['firebase', '@firebase/app', '@firebase/auth', '@firebase/firestore'],
  
  // ✅ CORREÇÃO: Configurações de webpack para melhorar performance mobile
  webpack: (config, { dev, isServer, dir }) => {
    if (dev && !isServer) {
      // Otimizar HMR para resolver Fast Refresh issues
      config.watchOptions = {
        poll: false, // Desabilitar polling para melhor performance
        aggregateTimeout: 200, // Reduzir delay
        ignored: ['**/node_modules', '**/.git', '**/.next', '**/out'],
      };
      
      // Configurações específicas para Fast Refresh
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false, // Desabilitar code splitting em dev para melhor HMR
      };
      
      // Melhorar cache para desenvolvimento
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
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
              test: /[\/]node_modules[\/](@firebase|firebase)[\/]/,
              priority: 35,
              enforce: true,
              maxSize: 200000,
            },
            
            // Stripe chunk separado - lazy load
            stripe: {
              name: 'stripe',
              chunks: 'async',
              test: /[\/]node_modules[\/](@stripe|stripe)[\/]/,
              priority: 30,
              enforce: true,
              maxSize: 150000,
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
        
        // Otimizações adicionais para mobile
        usedExports: true,
        sideEffects: false,
        concatenateModules: true,
        mangleExports: 'size',
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
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
  
  // Mobile-first optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https: http:; connect-src 'self' http://localhost:5000 https://finnextho-backend.onrender.com https://api.stripe.com https://finnextho-5d86e.firebaseapp.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebase.googleapis.com https://www.google.com https://accounts.google.com https://www.googleapis.com https://oauth2.googleapis.com https://www.google-analytics.com; frame-src 'self' https://js.stripe.com https://accounts.google.com; object-src 'none'; base-uri 'self';"
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
      // Cache headers para recursos externos críticos
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;