const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Chat = require('../models/Chat');
const bcrypt = require('bcrypt');

/**
 * Create a test user and return its details with authentication token
 * @returns {Promise<{user: Object, token: string}>} User object and token
 */
const createTestUser = async () => {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await User.create({
    email: `test${Date.now()}@example.com`,
    passwordHash
  });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return { user, token };
};

/**
 * Create a test resume for a user
 * @param {string} userId - User ID to associate with the resume
 * @returns {Promise<Object>} Created resume object
 */
const createTestResume = async (userId) => {
  const resume = await Resume.create({
    userId,
    originalText: 'Test resume content',
    versions: [{
      version: 'v0',
      text: 'Test resume content'
    }]
  });

  return resume;
};

/**
 * Create a test chat for a user and resume
 * @param {string} userId - User ID to associate with the chat
 * @param {string} resumeId - Resume ID to associate with the chat
 * @returns {Promise<Object>} Created chat object
 */
const createTestChat = async (userId, resumeId) => {
  const chat = await Chat.create({
    userId,
    resumeId,
    messages: [
      {
        role: 'user',
        msg: 'How can I improve my resume?',
        timestamp: new Date()
      },
      {
        role: 'bot',
        msg: 'Here are some suggestions to improve your resume...',
        timestamp: new Date()
      }
    ]
  });

  return chat;
};

/**
 * Clean up test data
 * @returns {Promise<void>}
 */
const cleanupTestData = async () => {
  await User.deleteMany({});
  await Resume.deleteMany({});
  await Chat.deleteMany({});
};

/**
 * Generate a valid MongoDB ObjectId
 * @returns {string} Valid MongoDB ObjectId
 */
const generateObjectId = () => {
  return new mongoose.Types.ObjectId().toString();
};

module.exports = {
  createTestUser,
  createTestResume,
  createTestChat,
  cleanupTestData,
  generateObjectId
}; 