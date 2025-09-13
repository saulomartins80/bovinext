import 'reflect-metadata';
import './config/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { httpsRedirect, httpsSecurityHeaders } from './middlewares/httpsRedirect';
import router from './routes';
import { errorHandler } from './middlewares/errorHandler';
import { Server } from 'http';

interface HealthCheckResponse {
  status: 'OK' | 'PARTIAL' | 'FAIL';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  resources: {
    memory: MemoryUsage;
    cpu?: CpuUsage;
  };
}

interface MemoryUsage {
  rss: string;
  heapTotal: string;
  heapUsed: string;
  external: string;
}

interface CpuUsage {
  load1m?: number;
  load5m?: number;
  load15m?: number;
}

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

// Aplicar redirecionamento HTTPS primeiro
app.use(httpsRedirect);

app.use(helmet());
app.use(httpsSecurityHeaders);
app.use(morgan('dev'));
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3001',
      'http://localhost:3001',
      'http://192.168.1.67:3001',
      'http://10.223.119.19:10000',
      'http://localhost:10000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Em desenvolvimento, permitir qualquer origin
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'x-auth-token', 
    'X-Requested-With',
    'X-Mobile-Request',
    'X-User-Agent',
    'Accept',
    'Origin'
  ],
  credentials: true,
  exposedHeaders: ['Authorization', 'Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  skipSuccessfulRequests: true,
  skipFailedRequests: false
});
app.use('/api/', apiLimiter);

// Middleware para forçar HTTPS em produção e garantir CORS
app.use((req, res, next) => {
  // Forçar HTTPS em produção
  if (process.env.NODE_ENV === 'production' && req.header('x-forwarded-proto') !== 'https') {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  
  // Headers de segurança obrigatórios
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.removeHeader('X-Powered-By');
  
  // Headers HTTPS obrigatórios em produção
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  
  // Garantir CORS headers em todas as respostas
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ];
  
  if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-auth-token, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  
  // Remover Cross-Origin-Opener-Policy para permitir popups do Google Auth
  res.removeHeader('Cross-Origin-Opener-Policy');
  
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    status: "BACKEND OPERACIONAL",
    ambiente: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    versao: process.env.npm_package_version || "1.0.0"
  });
});

app.get('/health', (async (req: express.Request, res: express.Response): Promise<void> => {
  const healthCheck: HealthCheckResponse = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
    resources: {
      memory: {
        rss: '0 MB',
        heapTotal: '0 MB',
        heapUsed: '0 MB',
        external: '0 MB'
      }
    }
  };

  try {
    const memory = process.memoryUsage();
    healthCheck.resources.memory = {
      rss: `${(memory.rss / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      external: `${(memory.external / 1024 / 1024).toFixed(2)} MB`
    };

    if (process.platform !== 'win32') {
      const os = require('os');
      const load = os.loadavg();
      healthCheck.resources.cpu = {
        load1m: load[0],
        load5m: load[1],
        load15m: load[2]
      };
    }

    res.status(200).json(healthCheck);

  } catch (error) {
    healthCheck.status = 'FAIL';
    res.status(503).json(healthCheck);
  }
}) as express.RequestHandler);

// Configuração do body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Apenas rotas BOVINEXT
app.use('/', router);

app.use(errorHandler as express.ErrorRequestHandler);

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

let server: Server;

server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;

