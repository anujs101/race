const httpMocks = require('node-mocks-http');
const validation = require('../../middleware/validation');

describe('Validation Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    next = jest.fn();
  });

  describe('validateRegister', () => {
    it('should call next for valid input', () => {
      req = httpMocks.createRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123'
        }
      });
      res = httpMocks.createResponse();

      validation.validateRegister(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 400 for invalid email', () => {
      req = httpMocks.createRequest({
        body: {
          email: 'invalid-email',
          password: 'Password123'
        }
      });
      res = httpMocks.createResponse();

      validation.validateRegister(req, res, next);
      
      const data = res._getJSONData();
      expect(res._getStatusCode()).toBe(400);
      expect(data).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('valid email')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 for short password', () => {
      req = httpMocks.createRequest({
        body: {
          email: 'test@example.com',
          password: 'pass'
        }
      });
      res = httpMocks.createResponse();

      validation.validateRegister(req, res, next);
      
      const data = res._getJSONData();
      expect(res._getStatusCode()).toBe(400);
      expect(data).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('at least 6 characters')
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('validateLogin', () => {
    it('should call next for valid input', () => {
      req = httpMocks.createRequest({
        body: {
          email: 'test@example.com',
          password: 'Password123'
        }
      });
      res = httpMocks.createResponse();

      validation.validateLogin(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 400 if email is missing', () => {
      req = httpMocks.createRequest({
        body: {
          password: 'Password123'
        }
      });
      res = httpMocks.createResponse();

      validation.validateLogin(req, res, next);
      
      const data = res._getJSONData();
      expect(res._getStatusCode()).toBe(400);
      expect(data).toEqual(expect.objectContaining({
        status: 'error',
        message: expect.stringContaining('email')
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 if password is missing', () => {
      req = httpMocks.createRequest({
        body: {
          email: 'test@example.com'
        }
      });
      res = httpMocks.createResponse();

      validation.validateLogin(req, res, next);
      
      const data = res._getJSONData();
      expect(res._getStatusCode()).toBe(400);
      expect(data).toEqual(expect.objectContaining({
        status: 'error', 
        message: expect.stringContaining('password')
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });
}); 