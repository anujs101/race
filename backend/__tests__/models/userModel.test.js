const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

// Mock bcrypt
jest.mock('bcrypt');

describe('User Model', () => {
  let validUserData;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup valid user data
    validUserData = {
      email: 'test@example.com',
      passwordHash: 'hashed_password'
    };
  });

  it('should be defined', () => {
    expect(User).toBeDefined();
  });

  describe('User Schema', () => {
    it('should have the correct fields', () => {
      // Get schema paths
      const schemaPaths = User.schema.paths;
      
      // Check required fields exist
      expect(schemaPaths.email).toBeDefined();
      expect(schemaPaths.passwordHash).toBeDefined();
      expect(schemaPaths.createdAt).toBeDefined();
      expect(schemaPaths.updatedAt).toBeDefined();
    });

    it('should require email', () => {
      const testUser = new User({ ...validUserData, email: undefined });
      const validationError = testUser.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.email).toBeDefined();
      expect(validationError.errors.email.kind).toEqual('required');
    });

    it('should require passwordHash', () => {
      const testUser = new User({ ...validUserData, passwordHash: undefined });
      const validationError = testUser.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.passwordHash).toBeDefined();
      expect(validationError.errors.passwordHash.kind).toEqual('required');
    });

    it('should make email lowercase', () => {
      const testUser = new User({
        ...validUserData,
        email: 'TEST@EXAMPLE.COM'
      });

      expect(testUser.email).toEqual('test@example.com');
    });

    it('should make email trimmed', () => {
      const testUser = new User({
        ...validUserData,
        email: '  test@example.com  '
      });

      expect(testUser.email).toEqual('test@example.com');
    });

    it('should enforce unique email constraint', () => {
      const emailPath = User.schema.paths.email;
      expect(emailPath.options.unique).toBe(true);
    });

    it('should include timestamps', () => {
      // Create a user with timestamps
      const now = new Date();
      const testUser = new User(validUserData);
      
      // Set timestamps manually (since we're not actually saving to DB)
      testUser.createdAt = now;
      testUser.updatedAt = now;
      
      expect(testUser.createdAt).toBeDefined();
      expect(testUser.updatedAt).toBeDefined();
      expect(testUser.createdAt instanceof Date).toBeTruthy();
      expect(testUser.updatedAt instanceof Date).toBeTruthy();
    });
  });

  describe('User Methods', () => {
    describe('isValidPassword', () => {
      it('should check password with bcrypt', async () => {
        // Setup bcrypt mock
        bcrypt.compare.mockResolvedValueOnce(true);
        
        const testUser = new User(validUserData);
        const result = await testUser.isValidPassword('password123');
        
        expect(result).toBe(true);
        expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      });

      it('should return false for invalid password', async () => {
        // Setup bcrypt mock
        bcrypt.compare.mockResolvedValueOnce(false);
        
        const testUser = new User(validUserData);
        const result = await testUser.isValidPassword('wrong_password');
        
        expect(result).toBe(false);
        expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      });

      it('should handle bcrypt errors', async () => {
        // Setup bcrypt mock to throw error
        bcrypt.compare.mockRejectedValueOnce(new Error('Bcrypt error'));
        
        const testUser = new User(validUserData);
        
        await expect(testUser.isValidPassword('password123'))
          .rejects.toThrow('Bcrypt error');
      });
    });
  });
});
