import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import transactionRoutes from './routes/transaction.routes';
import configRoutes from './routes/config.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rate-limit.middleware';
import { 
  sanitizeInput, 
  detectSuspiciousActivity, 
  securityHeaders 
} from './middleware/security.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Trust proxy for rate limiting behind reverse proxies (Railway, Heroku, etc.)
app.set('trust proxy', 1);

// Security middleware - helmet for secure headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false, // Required for some API calls
}));

// Additional security headers
app.use(securityHeaders);

// HTTP Parameter Pollution protection
app.use(hpp());

// Request logging middleware (limited in production)
app.use((req, res, next) => {
  if (isProduction) {
    // Minimal logging in production - only log path and method
    console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  } else {
    console.log(`📨 ${req.method} ${req.path} - ${req.ip} - ${new Date().toISOString()}`);
    console.log('📋 Headers:', req.headers.origin);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('📝 Body:', { ...req.body, password: req.body.password ? '[HIDDEN]' : undefined });
    }
  }
  next();
});

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL?.split(',') || [
  'http://localhost:5173', 
  'http://localhost:5001', 
  'https://skyeast.com', 
  'https://www.skyeast.com'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && !isProduction) {
      return callback(null, true);
    }
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Body parsing with size limits to prevent DoS
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Input sanitization and suspicious activity detection
app.use(sanitizeInput);
app.use(detectSuspiciousActivity);

// Global rate limiting
app.use('/api', apiLimiter);

// Health check (uses singleton prisma)
app.get('/health', async (req, res) => {
  try {
    // Check database connection using singleton
    const prisma = (await import('./utils/prisma')).default;
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/config', configRoutes);

// 404 handler for undefined routes
app.use(notFoundHandler);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
