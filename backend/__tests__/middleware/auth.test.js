const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const authenticate = require('../../middleware/auth');
const User = require('../../models/User');

// Mock JWT errors
class JsonWebTokenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'JsonWebTokenError';
  }
}

class TokenExpiredError extends Error {
  constructor(message, expiredAt) {
    super(message);
    this.name = 'TokenExpiredError';
    this.expiredAt = expiredAt;
  }
}

// Add these error classes to jwt mock
jwt.JsonWebTokenError = JsonWebTokenError;
jwt.TokenExpiredError = TokenExpiredError;

jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    await authenticate(req, res, next);
    
    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(401);
    expect(data).toEqual(expect.objectContaining({
      status: 'error',
      message: 'No token, authorization denied'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is invalid', async () => {
    // Setup invalid token
    req.headers.authorization = 'Bearer invalidtoken';
    jwt.verify.mockImplementation(() => {
      throw new JsonWebTokenError('Invalid token');
    });
    
    await authenticate(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', process.env.JWT_SECRET);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Invalid token'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is expired', async () => {
    // Setup expired token
    req.headers.authorization = 'Bearer expiredtoken';
    jwt.verify.mockImplementation(() => {
      throw new TokenExpiredError('Token expired', new Date());
    });
    
    await authenticate(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('expiredtoken', process.env.JWT_SECRET);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Token expired'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user does not exist', async () => {
    // Setup valid token but non-existent user
    req.headers.authorization = 'Bearer validtoken';
    const decoded = { id: 'nonexistentuser123' };
    jwt.verify.mockReturnValue(decoded);
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(null)
    });
    
    await authenticate(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith(decoded.id);
    expect(res._getStatusCode()).toBe(401);
    expect(res._getJSONData()).toEqual(expect.objectContaining({
      status: 'error',
      message: 'User does not exist'
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should add user to request and call next() if token is valid', async () => {
    // Setup valid token and existing user
    req.headers.authorization = 'Bearer validtoken';
    const decoded = { id: 'validuser123' };
    const mockUser = { _id: decoded.id, email: 'test@example.com' };
    
    jwt.verify.mockReturnValue(decoded);
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    
    await authenticate(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith(decoded.id);
    expect(req.user).toEqual(mockUser);
    expect(next).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200); // Default status code (not modified)
  });

  it('should handle server errors gracefully', async () => {
    // Setup valid token but database error
    req.headers.authorization = 'Bearer validtoken';
    const decoded = { id: 'validuser123' };
    jwt.verify.mockReturnValue(decoded);
    
    // Mock database error
    const dbError = new Error('Database connection error');
    User.findById.mockImplementation(() => {
      throw dbError;
    });
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await authenticate(req, res, next);
    
    expect(consoleSpy).toHaveBeenCalledWith('Auth middleware error:', dbError);
    expect(res._getStatusCode()).toBe(500);
    expect(res._getJSONData()).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Server error during authentication'
    }));
    expect(next).not.toHaveBeenCalled();
    
    // Restore console.error
    consoleSpy.mockRestore();
  });
});
