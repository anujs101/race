const mongoose = require('mongoose');
const Resume = require('../../models/Resume');

describe('Resume Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be defined', () => {
    expect(Resume).toBeDefined();
  });

  describe('Resume Schema', () => {
    it('should have the correct fields', () => {
      // Get schema paths
      const schemaPaths = Resume.schema.paths;
      
      // Check that required fields exist
      expect(schemaPaths.userId).toBeDefined();
      expect(schemaPaths.originalText).toBeDefined();
      expect(schemaPaths.versions).toBeDefined();
      expect(schemaPaths.createdAt).toBeDefined();
      expect(schemaPaths.updatedAt).toBeDefined();
    });

    it('should have required constraints', () => {
      // Test required fields
      const userIdOptions = Resume.schema.paths.userId.options;
      const originalTextOptions = Resume.schema.paths.originalText.options;
      
      expect(userIdOptions.required).toBeTruthy();
      expect(originalTextOptions.required).toBeTruthy();
    });
    
    it('should have proper reference to User model', () => {
      const userIdOptions = Resume.schema.paths.userId.options;
      expect(userIdOptions.ref).toBe('User');
    });
  });
}); 