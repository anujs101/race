const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { validateChatMessage, validateEnhancement } = require('../middleware/validation');
const {
  sendMessage,
  getChatHistory,
  clearChatHistory
} = require('../controllers/chatController');

// Protected routes - require authentication
router.use(authenticate);

// Chat routes with validation
router.post('/:resumeId', validateEnhancement, validateChatMessage, sendMessage);
router.get('/:resumeId', validateEnhancement, getChatHistory);
router.delete('/:resumeId', validateEnhancement, clearChatHistory);

module.exports = router; 