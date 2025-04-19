const jwt = require('jsonwebtoken');
const generateToken = require('../../utils/generateToken');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Generate Token Utility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should call jwt.sign with correct parameters', () => {
    // Mock jwt.sign to return a token
    const mockToken = 'mocked-jwt-token-123';
    jwt.sign.mockReturnValue(mockToken);
    
    // Call the generateToken function
    const userId = 'user123';
    const token = generateToken(userId);
    
    // Verify jwt.sign was called with correct params
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Verify the function returns the token from jwt.sign
    expect(token).toBe(mockToken);
  });
  
  it('should use process.env.JWT_SECRET as the secret key', () => {
    // Store original and set test JWT_SECRET
    const originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'test-secret-key';
    
    // Call the function
    generateToken('user123');
    
    // Verify JWT_SECRET was used
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      'test-secret-key',
      expect.any(Object)
    );
    
    // Restore original JWT_SECRET
    process.env.JWT_SECRET = originalSecret;
  });
  
  it('should set token expiration to 30 days', () => {
    // Call the function
    generateToken('user123');
    
    // Verify expiration setting
    expect(jwt.sign).toHaveBeenCalledWith(
      expect.any(Object),
      expect.any(String),
      { expiresIn: '30d' }
    );
  });
}); 