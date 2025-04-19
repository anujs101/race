const mongoose = require('mongoose');
const Chat = require('../../models/Chat');

describe('Chat Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should be defined', () => {
    expect(Chat).toBeDefined();
  });

  describe('Chat Schema', () => {
    it('should have the correct fields', () => {
      // Get schema paths
      const schemaPaths = Chat.schema.paths;
      
      // Check that required fields exist
      expect(schemaPaths.userId).toBeDefined();
      expect(schemaPaths.history).toBeDefined();
      expect(schemaPaths.createdAt).toBeDefined();
      expect(schemaPaths.updatedAt).toBeDefined();
    });

    it('should have required constraints', () => {
      // Test required fields
      const userIdOptions = Chat.schema.paths.userId.options;
      expect(userIdOptions.required).toBeTruthy();
    });
    
    it('should have proper reference to User model', () => {
      const userIdOptions = Chat.schema.paths.userId.options;
      expect(userIdOptions.ref).toBe('User');
    });

    it('should have history as an array', () => {
      const historyOptions = Chat.schema.paths.history.options;
      expect(Array.isArray(historyOptions.type)).toBeTruthy();
    });
  });
}); 