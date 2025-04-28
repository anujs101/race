const Resume = require('../models/Resume');
const { extractTextFromPDF, structureResumeData } = require('../utils/extract');
const { createEnhancement, generateCoverLetter, scoreATSCompatibility } = require('../utils/gemini');
let pythonEnhanceResume, generateLatex;

try {
  // Try to import from the main pythonBridge first
  const pythonBridge = require('../utils/pythonBridge');
  pythonEnhanceResume = pythonBridge.enhanceResume;
  generateLatex = pythonBridge.generateLatex;
  console.log('Using main Python bridge implementation');
} catch (error) {
  // Fall back to minimal bridge if main bridge fails
  console.log('Main Python bridge failed to load, using minimal implementation');
  const minimalBridge = require('../utils/minimal-bridge');
  pythonEnhanceResume = minimalBridge.enhanceResume;
  generateLatex = () => Promise.resolve('\\documentclass{article}\\begin{document}Minimal LaTeX implementation\\end{document}');
}

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Upload and process a resume
 * @route POST /api/resume/upload
 */
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    // Check file type
    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    if (fileExtension !== '.pdf') {
      return res.status(400).json({
        status: 'error',
        message: 'Only PDF files are supported'
      });
    }

    // Extract text from PDF
    const pdfBuffer = req.file.buffer;
    const extractedText = await extractTextFromPDF(pdfBuffer);

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({
        status: 'error',
        message: 'Could not extract text from the PDF. The file may be corrupted or empty.'
      });
    }

    // Structure resume data using Gemini
    const structuredData = await structureResumeData(extractedText);

    // Save resume to database
    const resume = await Resume.create({
      userId: req.user._id,
      originalText: extractedText,
      versions: [{
        version: 'v0',
        text: extractedText
      }]
    });

    res.status(201).json({
      status: 'success',
      message: 'Resume uploaded and processed successfully',
      data: {
        resumeId: resume._id,
        extractedText,
        structuredData
      }
    });
  } catch (error) {
    console.error('Error in uploadResume:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error processing resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Enhance a resume with Gemini
 * @route POST /api/resume/enhance/:resumeId
 */
const enhanceResume = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Get original text
    const originalText = resume.originalText;

    // Enhance resume using Gemini
    const { enhancedText, latexText } = await createEnhancement(originalText);

    // Return enhanced resume (we don't save it yet until user clicks "Save")
    res.status(200).json({
      status: 'success',
      message: 'Resume enhanced successfully',
      data: {
        resumeId,
        enhancedText,
        latexText
      }
    });
  } catch (error) {
    console.error('Error in enhanceResume:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error enhancing resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Save enhanced resume version
 * @route POST /api/resume/save/:resumeId
 */
const saveEnhancedResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { enhancedText, latexText } = req.body;

    if (!enhancedText) {
      return res.status(400).json({
        status: 'error',
        message: 'Enhanced text is required'
      });
    }

    // Find resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Determine version number
    const versionNumber = resume.versions.length;
    const versionLabel = `v${versionNumber}`;

    // Add new version
    resume.versions.push({
      version: versionLabel,
      text: enhancedText,
      latexText: latexText || null,
      createdAt: new Date()
    });

    await resume.save();

    res.status(200).json({
      status: 'success',
      message: 'Enhanced resume saved successfully',
      data: {
        resumeId,
        version: versionLabel
      }
    });
  } catch (error) {
    console.error('Error in saveEnhancedResume:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error saving enhanced resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all versions of a resume
 * @route GET /api/resume/:resumeId
 */
const getResumeVersions = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        resumeId,
        originalText: resume.originalText,
        versions: resume.versions
      }
    });
  } catch (error) {
    console.error('Error in getResumeVersions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching resume versions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate cover letter based on resume
 * @route POST /api/resume/cover-letter/:resumeId
 */
const generateCoverLetterForResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobTitle, company, jobDescription } = req.body;

    if (!jobTitle || !company || !jobDescription) {
      return res.status(400).json({
        status: 'error',
        message: 'Job title, company, and job description are required'
      });
    }

    // Find resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Get latest version text or original if no versions
    const latestVersion = resume.versions.length > 0 
      ? resume.versions[resume.versions.length - 1].text 
      : resume.originalText;

    // Generate cover letter
    const coverLetter = await generateCoverLetter(latestVersion, {
      title: jobTitle,
      company,
      description: jobDescription
    });

    res.status(200).json({
      status: 'success',
      message: 'Cover letter generated successfully',
      data: {
        coverLetter
      }
    });
  } catch (error) {
    console.error('Error in generateCoverLetterForResume:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error generating cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Generate an enhanced cover letter for a resume using Python script
 * @route POST /api/resume/generate-cover-letter/:resumeId
 */
const generateEnhancedCoverLetterForResume = async (req, res) => {
  try {
    console.log('generateEnhancedCoverLetterForResume called with params:', {
      resumeId: req.params.resumeId,
      body: JSON.stringify(req.body)
    });
    
    const { resumeId } = req.params;
    
    // Use normalized parameters from validation middleware if available, otherwise extract them directly
    let jobTitle, companyName, jobDescription;
    
    if (req.body.normalizedParams) {
      // Use already validated and normalized parameters
      ({ jobTitle, companyName, jobDescription } = req.body.normalizedParams);
    } else {
      // Handle both parameter naming formats directly (API standard and frontend format)
      jobTitle = req.body.jobTitle || req.body.selected_job_title;
      companyName = req.body.companyName;
      jobDescription = req.body.jobDescription || req.body.selected_job_description;
      
      // Input validation with detailed error messages
      const missingFields = [];
      if (!jobTitle || jobTitle.trim() === '') missingFields.push('jobTitle/selected_job_title');
      if (!companyName || companyName.trim() === '') missingFields.push('companyName');
      if (!jobDescription || jobDescription.trim() === '') missingFields.push('jobDescription/selected_job_description');

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: 'error',
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
    }

    // Find resume and validate ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to access it'
      });
    }

    // Get latest version text or original if no versions
    const latestVersion = resume.versions.length > 0 
      ? resume.versions[resume.versions.length - 1].text 
      : resume.originalText;

    // Path to Python script
    const scriptPath = path.join(__dirname, '../scripts/cover_letter_generator.py');
    
    // Import Python bridge
    const { executePythonScript } = require('../utils/pythonBridge');
    
    // Prepare parameters for Python script
    const scriptParams = {
      resumeText: latestVersion,
      jobTitle,
      jobDescription,
      companyName
    };
    
    console.log(`Executing cover letter generator script with params: ${JSON.stringify({
      resumeId,
      jobTitle,
      companyName,
      jobDescriptionLength: jobDescription.length
    })}`);
    
    // Execute Python script
    try {
      const result = await executePythonScript(scriptPath, scriptParams);
      
      // Check if the script returned an error
      if (result.status === 'error') {
        console.error('Error from Python script:', result.message);
        return res.status(500).json({
          status: 'error',
          message: result.message || 'Error generating cover letter'
        });
      }
      
      // Save the cover letter to the resume document
      const coverLetterVersions = resume.coverLetters || [];
      coverLetterVersions.push({
        jobTitle,
        companyName,
        content: result.data.coverLetter,
        createdAt: new Date()
      });
      
      resume.coverLetters = coverLetterVersions;
      await resume.save();
      
      // Return the cover letter
      return res.status(200).json({
        status: 'success',
        message: 'Cover letter generated successfully',
        data: {
          coverLetter: result.data.coverLetter,
          metadata: result.data.metadata
        }
      });
    } catch (scriptError) {
      console.error('Error executing Python script:', scriptError);
      return res.status(500).json({
        status: 'error',
        message: 'Server error generating cover letter',
        error: process.env.NODE_ENV === 'development' ? scriptError.message : undefined
      });
    }
  } catch (error) {
    console.error('Error in generateEnhancedCoverLetterForResume:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error generating cover letter',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Score resume for ATS compatibility
 * @route POST /api/resume/ats-score/:resumeId
 */
const scoreResumeForATS = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        status: 'error',
        message: 'Job description is required'
      });
    }

    // Find resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Get latest version text or original if no versions
    const latestVersion = resume.versions.length > 0 
      ? resume.versions[resume.versions.length - 1].text 
      : resume.originalText;

    // Score resume
    const atsScore = await scoreATSCompatibility(latestVersion, jobDescription);

    res.status(200).json({
      status: 'success',
      message: 'ATS compatibility score generated successfully',
      data: atsScore
    });
  } catch (error) {
    console.error('Error in scoreResumeForATS:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error scoring resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get all resumes for the current user
 * @route GET /api/resume
 */
const getAllResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .select('_id createdAt');

    res.status(200).json({
      status: 'success',
      data: resumes
    });
  } catch (error) {
    console.error('Error in getAllResumes:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching resumes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Extract text from uploaded resume, classify with Gemini, and save to database
 * @route POST /api/resume/extract
 */
const extractResumeText = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No resume file uploaded'
      });
    }

    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    let extractedText = '';
    const isScannedDocument = await isImageBasedPDF(req.file);
    
    if (isScannedDocument) {
      console.log('Detected image-based PDF, using Gemini Vision API for extraction...');
      // Use Gemini Vision API directly for image-based PDFs
      try {
        extractedText = await extractTextUsingGeminiVision(req.file.buffer, genAI);
      } catch (error) {
        console.error('Error using Gemini Vision for extraction:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to process image-based PDF',
          error: error.message
        });
      }
    } else {
      // For regular PDFs, use the text extraction utility
      try {
        const { extractTextFromFile } = require('../utils/extract');
        extractedText = await extractTextFromFile(req.file);
      } catch (error) {
        console.error('Text extraction failed:', error);
        return res.status(400).json({
          status: 'error',
          message: `Could not extract text: ${error.message}`
        });
      }
    }

    // If text is minimal or empty, return an error
    if (!extractedText || extractedText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Could not extract any text from the uploaded file'
      });
    }

    // Process with Gemini AI for classification
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
      You are an AI assistant helping to organize and enrich resume content.
      Given the following extracted resume text, classify it into categories:
      
      Contact Information (including name, email, phone number, address, LinkedIn URL)
      Education
      Experience (with role, organization, duration, and a short description of what the user did)
      Projects (with name and a 1-2 sentence description of the project)
      Skills
      Certifications
      Achievements (if any)
      
      Respond in the following structured JSON format only:
      {
        "contactInfo": {
          "name": "...",
          "email": "...",
          "phone": "...",
          "address": "...",
          "linkedin": "..."
        },
        "education": [ "..." ],
        "experience": [
          {
            "role": "...",
            "organization": "...",
            "duration": "...",
            "description": "..."
          }
        ],
        "projects": [
          {
            "name": "...",
            "description": "..."
          }
        ],
        "skills": [ "..." ],
        "certifications": [ "..." ],
        "achievements": [ "..." ]
      }
      
      Here's the resume text:
      ${extractedText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();
    
    // Parse the JSON response
    let classificationResult;
    try {
      // Extract JSON from the response (in case there's any markdown or other text)
      const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                        textResponse.match(/```\n([\s\S]*?)\n```/) ||
                        [null, textResponse];
      
      const jsonString = jsonMatch[1] || textResponse;
      classificationResult = JSON.parse(jsonString);
      
      // Validate required fields in the classification
      if (!classificationResult.education || !classificationResult.experience || 
          !classificationResult.skills || !classificationResult.projects) {
        throw new Error('Missing required classification fields');
      }
      
      // Ensure contactInfo exists, even if empty
      if (!classificationResult.contactInfo) {
        classificationResult.contactInfo = {
          name: "Not found",
          email: "Not found",
          phone: "Not found",
          address: "Not found",
          linkedin: "Not found"
        };
      }
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to process resume classification',
        error: error.message
      });
    }

    // Optional: Convert to LaTeX (simplified version)
    const latexText = generateBasicLatex(classificationResult);

    // Create resume in database
    const Resume = require('../models/Resume');
    
    const resume = new Resume({
      userId: req.user._id,
      originalText: extractedText,
      versions: [{
        version: '1.0',
        text: extractedText,
        latexText: latexText,
        classification: classificationResult,
        createdAt: new Date()
      }]
    });

    await resume.save();

    return res.status(201).json({
      status: 'success',
      message: isScannedDocument 
        ? 'Image-based resume processed using AI Vision' 
        : 'Resume extracted and classified successfully',
      data: {
        resumeId: resume._id,
        classification: classificationResult,
        isScannedDocument: isScannedDocument
      }
    });

  } catch (error) {
    console.error('Resume extraction error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process resume',
      error: error.message
    });
  }
};

/**
 * Check if a PDF is primarily image-based (scanned)
 * @param {Object} file - The uploaded file
 * @returns {Promise<boolean>} - Whether the PDF is image-based
 */
async function isImageBasedPDF(file) {
  if (file.mimetype !== 'application/pdf') {
    return false;
  }
  
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(file.buffer);
    const text = data.text.trim();
    
    // If the PDF has very little text, it's likely image-based
    return text.length < 200;
  } catch (error) {
    console.error('Error checking if PDF is image-based:', error);
    // If we can't parse it with pdf-parse, it might be image-based
    return true;
  }
}

/**
 * Extract text from an image-based PDF using Gemini Vision API
 * @param {Buffer} pdfBuffer - The PDF file buffer
 * @param {Object} genAI - The Gemini AI instance
 * @returns {Promise<string>} - The extracted text
 */
async function extractTextUsingGeminiVision(pdfBuffer, genAI) {
  try {
    // For Gemini Vision, we need to convert the PDF to base64
    const base64PDF = pdfBuffer.toString('base64');
    
    // Create a model that can process images
    const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      I'm uploading a resume in PDF format.
      Please extract all the text from this document as accurately as possible.
      
      Pay special attention to extracting the following information correctly:
      1. Full name of the person
      2. Email address (ensure exact format with @ symbol)
      3. Phone number (maintain the exact format as shown)
      4. Physical address or location
      5. LinkedIn profile URL if present
      
      Also focus on extracting:
      - Education details with degrees, institutions, and graduation dates
      - Work experience with company names, job titles, dates, and descriptions
      - Skills (both technical and soft skills)
      - Projects with names and descriptions
      - Certifications
      - Achievements
      
      Provide the extracted content as plain text, preserving the structure and formatting as much as possible.
      Include ALL text you can see in the document.
      Don't analyze or comment on the content, just extract the text.
    `;
    
    // Create content parts with the image
    const imagePart = {
      inlineData: {
        data: base64PDF,
        mimeType: 'application/pdf'
      }
    };
    
    // Generate content with the image
    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = await result.response;
    const extractedText = response.text();
    
    if (!extractedText || extractedText.trim().length === 0) {
      throw new Error('Gemini Vision API could not extract text from the PDF');
    }
    
    return extractedText;
  } catch (error) {
    console.error('Error in Gemini Vision extraction:', error);
    throw error;
  }
}

/**
 * Generate basic LaTeX version of the resume based on classification
 * @param {Object} classification - The classified resume data
 * @returns {String} Basic LaTeX formatted resume
 */
const generateBasicLatex = (classification) => {
  let latex = `
\\documentclass{article}
\\usepackage{geometry}
\\usepackage{titlesec}
\\usepackage{enumitem}
\\usepackage{hyperref}

\\geometry{a4paper, margin=1in}
\\titleformat{\\section}{\\normalfont\\Large\\bfseries}{}{0em}{}[\\titlerule]
\\setlist{noitemsep}

\\begin{document}

`;

  // Add contact information at the top
  if (classification.contactInfo) {
    const contactInfo = classification.contactInfo;
    if (contactInfo.name && contactInfo.name !== "Not found") {
      latex += `\\begin{center}\n\\textbf{\\Large ${contactInfo.name}}\n\\end{center}\n\n`;
    }
    
    latex += `\\begin{center}\n`;
    
    const contactDetails = [];
    if (contactInfo.email && contactInfo.email !== "Not found") {
      contactDetails.push(`Email: ${contactInfo.email}`);
    }
    if (contactInfo.phone && contactInfo.phone !== "Not found") {
      contactDetails.push(`Phone: ${contactInfo.phone}`);
    }
    if (contactInfo.address && contactInfo.address !== "Not found") {
      contactDetails.push(`Address: ${contactInfo.address}`);
    }
    if (contactInfo.linkedin && contactInfo.linkedin !== "Not found") {
      contactDetails.push(`LinkedIn: ${contactInfo.linkedin}`);
    }
    
    latex += contactDetails.join(' $\\mid$ ');
    latex += `\n\\end{center}\n\n`;
  }

  // Add education section
  latex += `\\section*{Education}
\\begin{itemize}
`;

  // Add education
  classification.education.forEach(edu => {
    latex += `  \\item ${edu}\n`;
  });

  latex += `\\end{itemize}

\\section*{Experience}
\\begin{itemize}
`;

  // Add experience
  classification.experience.forEach(exp => {
    latex += `  \\item \\textbf{${exp.role}} at ${exp.organization} (${exp.duration})
    \\\\${exp.description}\n`;
  });

  latex += `\\end{itemize}

\\section*{Projects}
\\begin{itemize}
`;

  // Add projects
  classification.projects.forEach(proj => {
    latex += `  \\item \\textbf{${proj.name}}: ${proj.description}\n`;
  });

  latex += `\\end{itemize}

\\section*{Skills}
\\begin{itemize}
`;

  // Add skills
  classification.skills.forEach(skill => {
    latex += `  \\item ${skill}\n`;
  });

  latex += `\\end{itemize}`;

  // Add certifications if present
  if (classification.certifications && classification.certifications.length > 0) {
    latex += `
\\section*{Certifications}
\\begin{itemize}
`;
    classification.certifications.forEach(cert => {
      latex += `  \\item ${cert}\n`;
    });
    latex += `\\end{itemize}`;
  }

  // Add achievements if present
  if (classification.achievements && classification.achievements.length > 0) {
    latex += `
\\section*{Achievements}
\\begin{itemize}
`;
    classification.achievements.forEach(achievement => {
      latex += `  \\item ${achievement}\n`;
    });
    latex += `\\end{itemize}`;
  }

  latex += `
\\end{document}
`;

  return latex;
};

/**
 * Process resume with Python enhancement
 * @route POST /api/resume/enhance-python/:resumeId
 */
const enhanceResumeWithPython = async (req, res) => {
  let startTime = Date.now();
  
  try {
    logger.info(`Starting enhanceResumeWithPython for resume: ${req.params.resumeId}`);
    const { resumeId } = req.params;
    
    // Find resume with timeout handling
    let resume;
    try {
      resume = await Promise.race([
        Resume.findOne({
          _id: resumeId,
          userId: req.user._id
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database query timeout')), 10000)
        )
      ]);
    } catch (dbError) {
      logger.error('Database error in enhanceResumeWithPython', { error: dbError });
      return res.status(500).json({
        status: 'error',
        message: 'Database error while fetching resume',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    if (!resume) {
      logger.warn(`Resume not found: ${resumeId}`);
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }
    
    logger.info(`Found resume ${resumeId}, elapsed time: ${Date.now() - startTime}ms`);

    // Get the latest version with classification data
    let classification = null;
    let latestVersionData = null;
    
    if (resume.versions && resume.versions.length > 0) {
      latestVersionData = resume.versions[resume.versions.length - 1];
      if (latestVersionData.classification) {
        classification = latestVersionData.classification;
      }
    }

    // If no classification data is found, extract it first
    if (!classification) {
      logger.info(`No classification found for resume ${resumeId}, attempting to classify`);
      try {
        // Get or extract text
        const textToProcess = resume.originalText;
        
        if (!textToProcess || textToProcess.trim() === '') {
          return res.status(400).json({
            status: 'error',
            message: 'Resume has no text content to process'
          });
        }
        
        logger.info(`Classifying resume text of length ${textToProcess.length}`);
        
        // Get Gemini API
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        
        if (!process.env.GEMINI_API_KEY) {
          logger.error('Gemini API key not found in environment variables');
          return res.status(500).json({
            status: 'error',
            message: 'Gemini API key not configured'
          });
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Create prompt for classification
        const prompt = `
          You are an AI assistant helping to organize and enrich resume content.
          Given the following extracted resume text, classify it into categories:
          
          Contact Information (including name, email, phone number, address, LinkedIn URL)
          Education
          Experience (with role, organization, duration, and a short description of what the user did)
          Projects (with name and a 1-2 sentence description of the project)
          Skills
          Certifications
          Achievements (if any)
          
          Respond in the following structured JSON format only:
          {
            "contactInfo": {
              "name": "...",
              "email": "...",
              "phone": "...",
              "address": "...",
              "linkedin": "..."
            },
            "education": [ "..." ],
            "experience": [
              {
                "role": "...",
                "organization": "...",
                "duration": "...",
                "description": "..."
              }
            ],
            "projects": [
              {
                "name": "...",
                "description": "..."
              }
            ],
            "skills": [ "..." ],
            "certifications": [ "..." ],
            "achievements": [ "..." ]
          }
          
          Here's the resume text:
          ${textToProcess}
        `;

        // Get classification from Gemini with timeout
        logger.info('Sending prompt to Gemini for classification');
        let geminiStart = Date.now();
        
        let result;
        try {
          result = await Promise.race([
            model.generateContent(prompt),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Gemini API request timeout')), 30000)
            )
          ]);
        } catch (geminiError) {
          logger.error('Gemini API request failed', { error: geminiError });
          return res.status(500).json({
            status: 'error',
            message: 'Error in Gemini classification',
            error: process.env.NODE_ENV === 'development' ? geminiError.message : undefined
          });
        }
        
        logger.info(`Gemini classification completed in ${Date.now() - geminiStart}ms`);
        
        const response = await result.response;
        const textResponse = response.text();
        
        // Parse the JSON response
        try {
          // Extract JSON from the response (in case there's any markdown or other text)
          const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/) || 
                          textResponse.match(/```\n([\s\S]*?)\n```/) ||
                          [null, textResponse];
          
          const jsonString = jsonMatch[1] || textResponse;
          classification = JSON.parse(jsonString);
          
          // Validate the classification structure
          if (!classification.contactInfo || !classification.education || 
              !classification.experience || !classification.skills || 
              !classification.projects) {
            throw new Error('Invalid classification structure');
          }
          
          // Update the latest version with classification
          if (latestVersionData) {
            latestVersionData.classification = classification;
            await resume.save();
          } else {
            // Create a new version with classification if none exists
            resume.versions.push({
              version: 'v0',
              text: resume.originalText,
              classification: classification,
              createdAt: new Date()
            });
            await resume.save();
          }
          
          logger.info('Successfully saved classification to resume');
        } catch (error) {
          logger.error('Error parsing Gemini classification response', { error });
          return res.status(500).json({
            status: 'error',
            message: 'Failed to parse resume classification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
          });
        }
      } catch (error) {
        logger.error('Error classifying resume with Gemini', { error });
        return res.status(500).json({
          status: 'error',
          message: 'Failed to classify resume with Gemini',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Prepare resume data for Python enhancement
    const resumeData = {
      data: {
        resumeId: resume._id.toString(),
        classification: classification,
        isScannedDocument: false
      }
    };

    // Process with Python enhancement
    try {
      logger.info(`Starting Python enhancement for resume ${resumeId}`);
      let pythonStart = Date.now();
      
      // Enhanced resume data from Python
      const enhancedData = await pythonEnhanceResume(resumeData);
      
      logger.info(`Python enhancement completed in ${Date.now() - pythonStart}ms`);
      
      // Generate LaTeX from the enhanced data
      logger.info('Starting LaTeX generation');
      let latexStart = Date.now();
      
      const latexText = await generateLatex(resumeData);
      
      logger.info(`LaTeX generation completed in ${Date.now() - latexStart}ms`);
      
      // Save the enhanced version
      try {
        // Add a new version with the enhancement
        resume.versions.push({
          version: `v${resume.versions.length}`,
          text: resume.originalText,
          classification: classification,
          enhancedData: enhancedData,
          latexText: latexText,
          createdAt: new Date()
        });
        
        await resume.save();
        logger.info('Successfully saved enhanced version to resume');
      } catch (saveError) {
        logger.error('Error saving enhanced version', { error: saveError });
        // Continue to return the enhanced data even if saving fails
      }
      
      // Return enhanced resume data
      logger.info(`Total processing time: ${Date.now() - startTime}ms`);
      
      return res.status(200).json({
        status: 'success',
        message: 'Resume enhanced successfully with Python',
        data: {
          resumeId,
          enhanced: enhancedData,
          latexText
        }
      });
    } catch (error) {
      logger.error('Error enhancing resume with Python', { error });
      return res.status(500).json({
        status: 'error',
        message: 'Server error enhancing resume with Python',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } catch (error) {
    logger.error('Error in enhanceResumeWithPython', { error });
    return res.status(500).json({
      status: 'error',
      message: 'Server error processing resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  uploadResume,
  enhanceResume,
  saveEnhancedResume,
  getResumeVersions,
  generateCoverLetterForResume,
  generateEnhancedCoverLetterForResume,
  scoreResumeForATS,
  getAllResumes,
  extractResumeText,
  enhanceResumeWithPython
}; 