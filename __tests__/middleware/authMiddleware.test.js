const jwt = require('jsonwebtoken');
const httpMocks = require('node-mocks-http');
const authenticate = require('../../middleware/auth');
const User = require('../../models/User');

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

  it('should extract token from Authorization header', async () => {
    req = httpMocks.createRequest({
      headers: {
        Authorization: 'Bearer testtoken123'
      }
    });
    
    jwt.verify = jest.fn().mockReturnValue({ id: 'testuser123' });
    
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue({
        _id: 'testuser123',
        email: 'test@example.com'
      })
    });

    await authenticate(req, res, next);
    
    expect(jwt.verify).toHaveBeenCalledWith('testtoken123', process.env.JWT_SECRET);
    expect(User.findById).toHaveBeenCalledWith('testuser123');
    expect(req.user).toBeDefined();
    expect(next).toHaveBeenCalled();
  });
  
  it('should return 401 if token is invalid', async () => {
    req = httpMocks.createRequest({
      headers: {
        Authorization: 'Bearer invalid-token'
      }
    });
    
    const error = new Error('Invalid token');
    error.name = 'JsonWebTokenError';
    jwt.verify = jest.fn().mockImplementation(() => {
      throw error;
    });

    await authenticate(req, res, next);
    
    const data = res._getJSONData();
    expect(res._getStatusCode()).toBe(401);
    expect(data).toEqual(expect.objectContaining({
      status: 'error',
      message: 'Invalid token'
    }));
    expect(next).not.toHaveBeenCalled();
  });
}); 