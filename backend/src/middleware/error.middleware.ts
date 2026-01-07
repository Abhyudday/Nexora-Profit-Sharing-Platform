import { Request, Response, NextFunction } from 'express';

const isProduction = process.env.NODE_ENV === 'production';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details (sanitized for production)
  if (isProduction) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      error: err.message,
      path: req.path,
      method: req.method,
      // Don't log stack traces or sensitive data in production
    }));
  } else {
    console.error('Error:', err);
  }

  const status = err.status || 500;
  
  // Don't expose internal error messages in production
  let message = 'Internal server error';
  
  if (!isProduction) {
    message = err.message || message;
  } else {
    // Only expose safe error messages in production
    const safeMessages = [
      'Invalid credentials',
      'User not found',
      'Not allowed by CORS',
      'Validation failed',
      'Too many requests',
      'Unauthorized',
      'Forbidden',
    ];
    
    if (safeMessages.some(m => err.message?.includes(m))) {
      message = err.message;
    }
  }

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      details: err.details 
    })
  });
};

// Not found handler
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
  });
};
