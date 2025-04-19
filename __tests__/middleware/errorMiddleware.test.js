const httpMocks = require('node-mocks-http');
const errorHandler = require('../../middleware/errorHandler');

describe('Error Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    console.error = jest.fn(); // Mock console.error to prevent test output pollution
  });

  it('should handle custom error statuses and messages', () => {
    const error = new Error('Test error');
    error.statusCode = 400;
    
    errorHandler(error, req, res, next);
    
    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(400);
    expect(data).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Test error'
    }));
  });

  it('should handle server errors with default 500 status', () => {
    const error = new Error('Server error');
    
    errorHandler(error, req, res, next);
    
    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(500);
    expect(data).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Server error'
    }));
  });
  
  it('should handle ValidationError with 400 status', () => {
    const error = new Error('Validation failed');
    error.name = 'ValidationError';
    error.errors = {
      field1: { message: 'Field1 is required' },
      field2: { message: 'Field2 is invalid' }
    };
    
    errorHandler(error, req, res, next);
    
    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(400);
    expect(data).toEqual(expect.objectContaining({
      status: 'error',
      message: expect.stringContaining('Field1 is required')
    }));
  });
  
  it('should handle JWT errors with 401 status', () => {
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    
    errorHandler(error, req, res, next);
    
    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(401);
    expect(data).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Invalid authentication token'
    }));
  });
}); 