const express = require('express');
const router = express.Router();
const { 
  getResumeVersions,
  enhanceResume, 
  saveEnhancedResume,
  generateCoverLetterForResume,
  generateEnhancedCoverLetterForResume,
  scoreResumeForATS,
  getAllResumes,
  extractResumeText
} = require('../controllers/resumeController');
const authenticate = require('../middleware/auth');
const { 
  validateEnhancement, 
  validateCoverLetter,
  validateEnhancedCoverLetter
} = require('../middleware/validation');

// Add multer for file uploads
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Only allow PDF and DOCX files
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type. Please upload PDF or DOCX files only.'), false);
    }
  }
});

// Resume routes
router.use(authenticate); // Apply authentication to all routes

// Get specific resume with all versions
router.get('/:resumeId', getResumeVersions);

// Enhance resume using AI
router.post('/enhance/:resumeId', validateEnhancement, enhanceResume);

// Save enhanced resume version
router.post('/save/:resumeId', saveEnhancedResume);

// Generate cover letter using Gemini API
router.post('/cover-letter/:resumeId', validateCoverLetter, generateCoverLetterForResume);

// Generate enhanced cover letter using Python script
router.post('/generate-cover-letter/:resumeId', validateEnhancedCoverLetter, generateEnhancedCoverLetterForResume);

// Score resume against job description
router.post('/ats-score/:resumeId', validateEnhancement, scoreResumeForATS);

// Get all user resumes
router.get('/', getAllResumes);

// Extract resume from uploaded file
router.post('/extract', upload.single('resume'), extractResumeText);

module.exports = router; 