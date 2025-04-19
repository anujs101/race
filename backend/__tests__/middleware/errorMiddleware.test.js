const httpMocks = require('node-mocks-http');
const { notFound, errorHandler } = require('../../middleware/errorMiddleware');

describe('Error Middleware', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });
  
  describe('notFound', () => {
    it('should create a 404 error for undefined routes', () => {
      // Set original URL
      req.originalUrl = '/api/undefined-route';
      
      notFound(req, res, next);
      
      // Verify error is passed to next middleware
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(`Not Found - ${req.originalUrl}`);
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('errorHandler', () => {
    it('should return 500 status code and error message in production mode', () => {
      // Set production environment
      process.env.NODE_ENV = 'production';
      
      // Create sample error
      const error = new Error('Server error');
      
      errorHandler(error, req, res, next);
      
      // Verify response
      expect(res._getStatusCode()).toBe(500);
      expect(res._getJSONData()).toEqual({
        message: 'Server error'
      });
      
      // Reset environment
      process.env.NODE_ENV = 'test';
    });
    
    it('should return custom status code if defined in the error', () => {
      // Create error with custom status code
      const error = new Error('Not found');
      error.statusCode = 404;
      
      errorHandler(error, req, res, next);
      
      // Verify response has custom status code
      expect(res._getStatusCode()).toBe(404);
      expect(res._getJSONData()).toEqual({
        message: 'Not found',
        stack: expect.any(String)
      });
    });
    
    it('should include stack trace in development mode', () => {
      // Set development environment
      process.env.NODE_ENV = 'development';
      
      // Create sample error with stack trace
      const error = new Error('Test error');
      
      errorHandler(error, req, res, next);
      
      // Verify response includes stack trace
      expect(res._getJSONData()).toHaveProperty('stack');
      expect(res._getJSONData().stack).toBe(error.stack);
      
      // Reset environment
      process.env.NODE_ENV = 'test';
    });
    
    it('should not include stack trace in production mode', () => {
      // Set production environment
      process.env.NODE_ENV = 'production';
      
      // Create sample error
      const error = new Error('Test error');
      
      errorHandler(error, req, res, next);
      
      // Verify response does not include stack trace
      expect(res._getJSONData()).not.toHaveProperty('stack');
      
      // Reset environment
      process.env.NODE_ENV = 'test';
    });
  });
}); 