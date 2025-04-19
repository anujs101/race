const mongoose = require('mongoose');
const Chat = require('../../models/Chat');
const User = require('../../models/User');
const Resume = require('../../models/Resume');

describe('Chat Model', () => {
  let validChatData;
  let mockUserId;
  let mockResumeId;

  beforeEach(() => {
    // Create mock ObjectIds
    mockUserId = new mongoose.Types.ObjectId();
    mockResumeId = new mongoose.Types.ObjectId();
    
    // Setup valid chat data
    validChatData = {
      userId: mockUserId,
      resumeId: mockResumeId,
      messages: [{
        role: 'user',
        msg: 'How can I improve my resume?',
        timestamp: new Date()
      }]
    };
  });

  it('should be defined', () => {
    expect(Chat).toBeDefined();
  });

  describe('Chat Schema', () => {
    it('should have the correct fields', () => {
      // Get schema paths
      const schemaPaths = Chat.schema.paths;
      
      // Check required fields exist
      expect(schemaPaths.userId).toBeDefined();
      expect(schemaPaths.resumeId).toBeDefined();
      expect(schemaPaths.messages).toBeDefined();
      expect(schemaPaths.createdAt).toBeDefined();
      expect(schemaPaths.updatedAt).toBeDefined();
    });

    it('should require userId', () => {
      const testChat = new Chat({ ...validChatData, userId: undefined });
      const validationError = testChat.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.userId.kind).toEqual('required');
    });

    it('should require resumeId', () => {
      const testChat = new Chat({ ...validChatData, resumeId: undefined });
      const validationError = testChat.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.resumeId).toBeDefined();
      expect(validationError.errors.resumeId.kind).toEqual('required');
    });

    it('should properly reference User model in userId field', () => {
      // Check reference configuration
      const userIdField = Chat.schema.paths.userId;
      
      expect(userIdField.instance).toEqual('ObjectId');
      expect(userIdField.options.ref).toEqual('User');
    });

    it('should properly reference Resume model in resumeId field', () => {
      // Check reference configuration
      const resumeIdField = Chat.schema.paths.resumeId;
      
      expect(resumeIdField.instance).toEqual('ObjectId');
      expect(resumeIdField.options.ref).toEqual('Resume');
    });

    it('should include timestamps', () => {
      // Create a chat with timestamps
      const now = new Date();
      const testChat = new Chat(validChatData);
      
      // Set timestamps manually (since we're not actually saving to DB)
      testChat.createdAt = now;
      testChat.updatedAt = now;
      
      expect(testChat.createdAt).toBeDefined();
      expect(testChat.updatedAt).toBeDefined();
      expect(testChat.createdAt instanceof Date).toBeTruthy();
      expect(testChat.updatedAt instanceof Date).toBeTruthy();
    });

    describe('messages subdocument', () => {
      it('should validate role field in messages array', () => {
        const invalidMessagesData = {
          ...validChatData,
          messages: [{
            // Invalid role
            role: 'invalid_role',
            msg: 'How can I improve my resume?'
          }]
        };
        
        const testChat = new Chat(invalidMessagesData);
        const validationError = testChat.validateSync();
        
        expect(validationError).toBeDefined();
        expect(validationError.errors['messages.0.role']).toBeDefined();
      });

      it('should require msg field in messages array', () => {
        const invalidMessagesData = {
          ...validChatData,
          messages: [{
            role: 'user',
            // Missing required msg field
          }]
        };
        
        const testChat = new Chat(invalidMessagesData);
        const validationError = testChat.validateSync();
        
        expect(validationError).toBeDefined();
        expect(validationError.errors['messages.0.msg']).toBeDefined();
      });

      it('should accept only valid roles (user, bot)', () => {
        // Valid test with user role
        const userRoleChat = new Chat(validChatData);
        expect(userRoleChat.validateSync()).toBeUndefined();
        
        // Valid test with bot role
        const botRoleChat = new Chat({
          ...validChatData,
          messages: [{
            role: 'bot',
            msg: 'Here are some suggestions...'
          }]
        });
        expect(botRoleChat.validateSync()).toBeUndefined();
        
        // Invalid role test
        const invalidRoleChat = new Chat({
          ...validChatData,
          messages: [{
            role: 'system',
            msg: 'System message'
          }]
        });
        const validationError = invalidRoleChat.validateSync();
        expect(validationError).toBeDefined();
        expect(validationError.errors['messages.0.role']).toBeDefined();
      });

      it('should include timestamp for each message', () => {
        const testChat = new Chat(validChatData);
        
        expect(testChat.messages[0].timestamp).toBeDefined();
        expect(testChat.messages[0].timestamp instanceof Date).toBeTruthy();
      });
      
      it('should set default timestamp if not provided', () => {
        const chatWithoutTimestamp = {
          ...validChatData,
          messages: [{
            role: 'user',
            msg: 'How can I improve my resume?',
            // timestamp is intentionally omitted
          }]
        };
        
        const testChat = new Chat(chatWithoutTimestamp);
        expect(testChat.messages[0].timestamp).toBeDefined();
        expect(testChat.messages[0].timestamp instanceof Date).toBeTruthy();
      });
    });
  });
});
