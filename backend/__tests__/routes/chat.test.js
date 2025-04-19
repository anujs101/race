const request = require('supertest');
const app = require('../../app');
const { 
  createTestUser, 
  createTestResume, 
  createTestChat,
  cleanupTestData,
  generateObjectId 
} = require('../testUtils');

describe('Chat Routes', () => {
  let user, token, resume, chat;

  // Setup before each test
  beforeEach(async () => {
    // Create a test user
    const testData = await createTestUser();
    user = testData.user;
    token = testData.token;
    
    // Create a test resume
    resume = await createTestResume(user._id);
    
    // Create a test chat
    chat = await createTestChat(user._id, resume._id);
  });

  // Clean up after tests
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/chat/:resumeId', () => {
    it('should get chat history for a resume', async () => {
      const response = await request(app)
        .get(`/api/chat/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBeGreaterThan(0);
    });

    it('should return empty messages array if no chat exists', async () => {
      // Create a new resume without chat
      const newResume = await createTestResume(user._id);
      
      const response = await request(app)
        .get(`/api/chat/${newResume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('messages');
      expect(Array.isArray(response.body.data.messages)).toBe(true);
      expect(response.body.data.messages.length).toBe(0);
    });

    it('should return 404 for non-existent resume', async () => {
      const nonExistentId = generateObjectId();
      
      const response = await request(app)
        .get(`/api/chat/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/chat/:resumeId', () => {
    it('should send a message and get a response', async () => {
      const messageData = {
        message: 'How can I improve my skills section?'
      };

      const response = await request(app)
        .post(`/api/chat/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(messageData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('chat');
      expect(Array.isArray(response.body.data.chat)).toBe(true);
      
      // Should contain at least the original message and the new message
      expect(response.body.data.chat.length).toBeGreaterThan(0);
    });

    it('should return 400 if message is missing', async () => {
      const response = await request(app)
        .post(`/api/chat/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('required');
    });

    it('should create a new chat if none exists', async () => {
      // Create a new resume without chat
      const newResume = await createTestResume(user._id);
      
      const messageData = {
        message: 'Can you help me improve my resume?'
      };

      const response = await request(app)
        .post(`/api/chat/${newResume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(messageData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data).toHaveProperty('chat');
      expect(Array.isArray(response.body.data.chat)).toBe(true);
      expect(response.body.data.chat.length).toBe(2); // User message + bot response
    });
  });

  describe('DELETE /api/chat/:resumeId', () => {
    it('should clear chat history', async () => {
      const response = await request(app)
        .delete(`/api/chat/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('cleared');
      
      // Verify chat was deleted by trying to fetch it
      const getResponse = await request(app)
        .get(`/api/chat/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
        
      expect(getResponse.body.data.messages).toHaveLength(0);
    });

    it('should return 200 even if no chat exists', async () => {
      // Create a new resume without chat
      const newResume = await createTestResume(user._id);
      
      const response = await request(app)
        .delete(`/api/chat/${newResume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('cleared');
    });
  });
}); 