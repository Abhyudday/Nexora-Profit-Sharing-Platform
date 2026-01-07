import { Request, Response, NextFunction } from 'express';

// Sanitize request body to prevent XSS
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    sanitizeObject(req.body);
  }
  if (req.query) {
    sanitizeObject(req.query as Record<string, any>);
  }
  if (req.params) {
    sanitizeObject(req.params);
  }
  next();
};

function sanitizeObject(obj: Record<string, any>) {
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      // Remove dangerous characters that could be used for XSS
      obj[key] = obj[key]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitizeObject(obj[key]);
    }
  }
}

// Check for suspicious activity
export const detectSuspiciousActivity = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i, // SQL injection
    /<script/i, // XSS
    /javascript:/i, // XSS
    /\.\.\//g, // Path traversal
    /\0/g, // Null byte injection
  ];

  const checkValue = (value: string): boolean => {
    return suspiciousPatterns.some(pattern => pattern.test(value));
  };

  const checkObject = (obj: Record<string, any>): boolean => {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && checkValue(obj[key])) {
        return true;
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (checkObject(obj[key])) return true;
      }
    }
    return false;
  };

  if (
    (req.body && checkObject(req.body)) ||
    (req.query && checkObject(req.query as Record<string, any>)) ||
    (req.params && checkObject(req.params))
  ) {
    console.warn(`⚠️ Suspicious request detected from IP: ${req.ip}, Path: ${req.path}`);
    return res.status(400).json({ error: 'Invalid request' });
  }

  next();
};

// Validate content type
export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      // Allow multipart/form-data for file uploads if needed
      if (!contentType?.includes('multipart/form-data')) {
        return res.status(415).json({ error: 'Content-Type must be application/json' });
      }
    }
  }
  next();
};

// Add security-related response headers
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
};

// Log security events
export const logSecurityEvent = (
  eventType: string,
  req: Request,
  details?: Record<string, any>
) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    ip: req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    path: req.path,
    method: req.method,
    ...details,
  };
  
  // In production, this should be sent to a logging service
  if (process.env.NODE_ENV === 'production') {
    console.log(JSON.stringify(logEntry));
  } else {
    console.log('🔐 Security Event:', logEntry);
  }
};
