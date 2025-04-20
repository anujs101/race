// Validation middleware for different routes

// User register validation
const validateRegister = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }

  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      status: 'error',
      errors 
    });
  }

  next();
};

// User login validation
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  // Email validation
  if (!email) {
    errors.email = 'Email is required';
  }

  // Password validation
  if (!password) {
    errors.password = 'Password is required';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      status: 'error',
      errors 
    });
  }

  next();
};

// Resume upload validation
const validateResumeUpload = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ 
      status: 'error',
      message: 'No file uploaded' 
    });
  }
  
  next();
};

// Resume enhancement validation
const validateEnhancement = (req, res, next) => {
  const { resumeId } = req.params;
  
  if (!resumeId) {
    return res.status(400).json({ 
      status: 'error',
      message: 'Resume ID is required' 
    });
  }
  
  next();
};

// Cover letter generation validation
const validateCoverLetter = (req, res, next) => {
  const { jobTitle, company, jobDescription } = req.body;
  const errors = {};

  if (!jobTitle) {
    errors.jobTitle = 'Job title is required';
  }
  
  if (!company) {
    errors.company = 'Company name is required';
  }
  
  if (!jobDescription) {
    errors.jobDescription = 'Job description is required';
  }

  // Return errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      status: 'error',
      errors 
    });
  }
  
  next();
};

// Chat message validation
const validateChatMessage = (req, res, next) => {
  const { message } = req.body;
  
  if (!message || message.trim() === '') {
    return res.status(400).json({ 
      status: 'error',
      message: 'Message is required' 
    });
  }
  
  next();
};

// Job matching validation
const validateJobMatch = (req, res, next) => {
  const { jobTitle, location, limit } = req.body;
  const errors = [];

  // Job title is required
  if (!jobTitle || jobTitle.trim() === '') {
    errors.push('Job title is required');
  }
  
  // Validate limit if provided
  if (limit && (isNaN(limit) || parseInt(limit, 10) <= 0)) {
    errors.push('Limit must be a positive number');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ 
      status: 'error',
      message: errors.join('. ')
    });
  }
  
  next();
};

// Enhanced cover letter generation validation
const validateEnhancedCoverLetter = (req, res, next) => {
  // Handle both parameter naming formats (API standard and frontend format)
  const jobTitle = req.body.jobTitle || req.body.selected_job_title;
  const companyName = req.body.companyName;
  const jobDescription = req.body.jobDescription || req.body.selected_job_description;
  
  const errors = [];

  // Job title validation
  if (!jobTitle || jobTitle.trim() === '') {
    errors.push('Job title is required (jobTitle or selected_job_title)');
  }
  
  // Company name validation
  if (!companyName || companyName.trim() === '') {
    errors.push('Company name is required');
  }
  
  // Job description validation
  if (!jobDescription || jobDescription.trim() === '') {
    errors.push('Job description is required (jobDescription or selected_job_description)');
  }

  // Return errors if any
  if (errors.length > 0) {
    return res.status(400).json({ 
      status: 'error',
      message: errors.join('. ')
    });
  }
  
  // Add normalized parameters to the request for easier handling in the controller
  req.body.normalizedParams = {
    jobTitle,
    companyName,
    jobDescription
  };
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateResumeUpload,
  validateEnhancement,
  validateCoverLetter,
  validateChatMessage,
  validateJobMatch,
  validateEnhancedCoverLetter
}; 