const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { validateJobMatch } = require('../middleware/validation');
const { findJobMatches } = require('../controllers/jobController');

// All job routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/jobs/find-matches
 * @desc    Find jobs matching the provided criteria and optionally a resume
 * @access  Private
 */
router.post('/find-matches', validateJobMatch, findJobMatches);

module.exports = router; 