const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

// Mock bcrypt
jest.mock('bcrypt');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be defined', () => {
    expect(User).toBeDefined();
  });
  
  describe('User Schema', () => {
    it('should have the correct fields', () => {
      // Get schema paths
      const schemaPaths = User.schema.paths;
      
      // Check that required fields exist
      expect(schemaPaths.email).toBeDefined();
      expect(schemaPaths.passwordHash).toBeDefined();
      expect(schemaPaths.createdAt).toBeDefined();
      expect(schemaPaths.updatedAt).toBeDefined();
    });
    
    it('should have required constraints', () => {
      // Test required fields
      const emailOptions = User.schema.paths.email.options;
      const passwordHashOptions = User.schema.paths.passwordHash.options;
      
      expect(emailOptions.required).toBeTruthy();
      expect(passwordHashOptions.required).toBeTruthy();
    });
    
    it('should ensure email is unique', () => {
      const emailOptions = User.schema.paths.email.options;
      expect(emailOptions.unique).toBeTruthy();
    });
    
    it('should ensure email is lowercase', () => {
      const emailOptions = User.schema.paths.email.options;
      expect(emailOptions.lowercase).toBeTruthy();
    });
  });
  
  describe('isValidPassword method', () => {
    it('should compare password with hashed password correctly', async () => {
      // Create mock user
      const user = new User({
        email: 'test@example.com',
        passwordHash: 'hashedpassword123'
      });
      
      // Mock bcrypt.compare
      bcrypt.compare.mockImplementation((plainPassword, hashedPassword) => {
        return Promise.resolve(plainPassword === 'correctpassword');
      });
      
      // Test with correct password
      const matchCorrect = await user.isValidPassword('correctpassword');
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword123');
      expect(matchCorrect).toBe(true);
      
      // Test with incorrect password
      const matchIncorrect = await user.isValidPassword('wrongpassword');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedpassword123');
      expect(matchIncorrect).toBe(false);
    });
  });
}); 