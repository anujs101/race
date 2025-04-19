// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error for server-side debugging
  console.error(err.stack);
  
  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong on the server';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    // Mongoose validation error
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  } else if (err.name === 'CastError') {
    // Mongoose invalid ObjectId
    statusCode = 400;
    message = 'Resource not found';
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    statusCode = 400;
    message = 'Duplicate field value entered';
  } else if (err.name === 'TokenExpiredError') {
    // JWT expired token
    statusCode = 401;
    message = 'Your token has expired, please login again';
  } else if (err.name === 'JsonWebTokenError') {
    // JWT invalid token
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler; 