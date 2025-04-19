const Chat = require('../models/Chat');
const Resume = require('../models/Resume');
const { flatten_resume_json } = require('../utils/resumeFormatter');
const { isLatexContent, extractLatexContent, convertLatexToPdf } = require('../utils/latexToPdf');

/**
 * Send a message to the chatbot
 * @route POST /api/chat/:resumeId
 */
const sendMessage = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required'
      });
    }

    // Find resume
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    }).lean(); // Use lean() for better performance

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found'
      });
    }

    // Find or create chat
    let chat = await Chat.findOne({
      resumeId,
      userId: req.user._id
    });

    if (!chat) {
      chat = await Chat.create({
        resumeId,
        userId: req.user._id,
        messages: []
      });
    }

    // Add user message to chat
    chat.messages.push({
      role: 'user',
      msg: message,
      timestamp: new Date()
    });

    let botResponse;
    try {
      // Process different types of user messages
      const lowerCaseMessage = message.toLowerCase();
      
      // Check if user is asking for specific information or actions
      if (lowerCaseMessage.includes('latex') || 
          lowerCaseMessage.includes('pdf') || 
          lowerCaseMessage.includes('convert') || 
          lowerCaseMessage.includes('professional')) {
        // Generate LaTeX content
        const resumeContent = await generateFormattedResumeContent(resume);
        
        // Create LaTeX document
        botResponse = `\\documentclass{article}
\\usepackage[margin=1in]{geometry}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage{fontawesome}

\\begin{document}

% This is a LaTeX version of your resume
\\section*{Resume}

${resumeContent}

\\end{document}`;
      } else {
        // Generate standard resume text for other messages
        botResponse = await generateFormattedResumeText(resume, resumeId);
      }
    } catch (formatError) {
      console.error('Error formatting resume data:', formatError);
      botResponse = 'I apologize, but I was unable to process your resume data. Please try again or contact support if the issue persists.';
    }

    // Add bot response to chat
    chat.messages.push({
      role: 'bot',
      msg: botResponse,
      timestamp: new Date()
    });

    // Save chat
    await chat.save();

    // Prepare response object
    const responseData = {
      success: true,
      chat: chat.messages,
      message: botResponse
    };

    // Check if the response contains LaTeX content
    if (isLatexContent(botResponse)) {
      try {
        // Extract LaTeX content
        const latexContent = extractLatexContent(botResponse);
        
        if (latexContent) {
          // Determine the current version number for the filename
          const versionNumber = chat.messages.filter(m => 
            m.role === 'bot' && isLatexContent(m.msg)
          ).length;
          
          // Create base filename
          const baseFilename = `resume_${resumeId}_v${versionNumber}`;
          
          try {
            // Try to convert LaTeX to PDF
            const { base64Pdf, filename } = await convertLatexToPdf(latexContent, baseFilename);
            
            // Add PDF data to response if conversion succeeded
            responseData.pdf = base64Pdf;
            responseData.filename = filename;
            responseData.hasLaTeX = true;
          } catch (pdfError) {
            console.warn('PDF conversion failed, returning LaTeX content only:', pdfError.message);
            // Still indicate that LaTeX is present even if PDF conversion failed
            responseData.hasLaTeX = true;
            responseData.latexContent = latexContent;
            responseData.pdfError = pdfError.message;
          }
        }
      } catch (latexError) {
        console.error('Error processing LaTeX content:', latexError);
        // Continue with normal response
      }
    }

    // Return the response, with or without PDF
    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error processing chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Helper function to generate formatted resume text
 * @param {Object} resume - Resume document
 * @param {string} resumeId - Resume ID
 * @returns {string} Formatted resume text
 */
const generateFormattedResumeText = async (resume, resumeId) => {
  // Get latest resume version with classification data
  let classification = null;
  
  if (resume.versions && resume.versions.length > 0) {
    // Get the latest version
    const latestVersion = resume.versions[resume.versions.length - 1];
    
    // Check if it has classification data
    if (latestVersion.classification) {
      classification = latestVersion.classification;
    }
  }
  
  // If no classification was found, try to create a basic one from the text
  if (!classification) {
    console.warn(`No classification data found for resume ${resumeId}, creating basic structure`);
    classification = {
      contactInfo: {},
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      achievements: []
    };
  }
  
  // Create resume data object with necessary structure for flatten_resume_json
  const resumeData = {
    data: {
      resumeId: resume._id.toString(),
      classification: classification,
      isScannedDocument: false
    }
  };
  
  // Format resume using our utility function
  return flatten_resume_json(resumeData);
};

/**
 * Helper function to generate formatted resume content for LaTeX
 * @param {Object} resume - Resume document
 * @returns {string} LaTeX-formatted resume content
 */
const generateFormattedResumeContent = async (resume) => {
  // Get the classification data
  let classification = null;
  
  if (resume.versions && resume.versions.length > 0) {
    const latestVersion = resume.versions[resume.versions.length - 1];
    if (latestVersion.classification) {
      classification = latestVersion.classification;
    }
  }
  
  if (!classification) {
    return "No resume data available.";
  }
  
  // Build LaTeX content
  const content = [];
  
  // Contact info
  const contact = classification.contactInfo || {};
  content.push(`\\textbf{${contact.name || 'Name Not Available'}}`);
  
  // Contact details
  const contactDetails = [];
  if (contact.email) contactDetails.push(`Email: ${contact.email}`);
  if (contact.phone) contactDetails.push(`Phone: ${contact.phone}`);
  if (contact.address) contactDetails.push(`Address: ${contact.address}`);
  if (contact.linkedin) contactDetails.push(`LinkedIn: ${contact.linkedin}`);
  
  if (contactDetails.length > 0) {
    content.push(contactDetails.join(' $\\mid$ '));
  }
  content.push('\\vspace{0.5em}');
  
  // Education
  if (classification.education && classification.education.length > 0) {
    content.push('\\section*{Education}');
    content.push('\\begin{itemize}[leftmargin=*]');
    for (const edu of classification.education) {
      content.push(`\\item ${edu}`);
    }
    content.push('\\end{itemize}');
  }
  
  // Experience
  if (classification.experience && classification.experience.length > 0) {
    content.push('\\section*{Experience}');
    content.push('\\begin{itemize}[leftmargin=*]');
    for (const exp of classification.experience) {
      if (typeof exp === 'object' && exp !== null) {
        const role = exp.role || 'Role';
        const org = exp.organization || 'Organization';
        const duration = exp.duration || 'Duration';
        content.push(`\\item \\textbf{${role}} at ${org} (${duration})`);
        if (exp.description) {
          content.push('\\begin{itemize}[leftmargin=*]');
          content.push(`\\item ${exp.description}`);
          content.push('\\end{itemize}');
        }
      } else if (typeof exp === 'string') {
        content.push(`\\item ${exp}`);
      }
    }
    content.push('\\end{itemize}');
  }
  
  // Projects
  if (classification.projects && classification.projects.length > 0) {
    content.push('\\section*{Projects}');
    content.push('\\begin{itemize}[leftmargin=*]');
    for (const proj of classification.projects) {
      if (typeof proj === 'object' && proj !== null) {
        const name = proj.name || 'Project';
        const desc = proj.description || '';
        const projectText = desc ? `\\item \\textbf{${name}}: ${desc}` : `\\item \\textbf{${name}}`;
        content.push(projectText);
      } else if (typeof proj === 'string') {
        content.push(`\\item ${proj}`);
      }
    }
    content.push('\\end{itemize}');
  }
  
  // Skills
  if (classification.skills && classification.skills.length > 0) {
    content.push('\\section*{Skills}');
    content.push(classification.skills.join(', '));
  }
  
  // Certifications
  if (classification.certifications && classification.certifications.length > 0) {
    content.push('\\section*{Certifications}');
    content.push('\\begin{itemize}[leftmargin=*]');
    for (const cert of classification.certifications) {
      content.push(`\\item ${cert}`);
    }
    content.push('\\end{itemize}');
  }
  
  // Achievements
  if (classification.achievements && classification.achievements.length > 0) {
    content.push('\\section*{Achievements}');
    content.push('\\begin{itemize}[leftmargin=*]');
    for (const ach of classification.achievements) {
      content.push(`\\item ${ach}`);
    }
    content.push('\\end{itemize}');
  }
  
  return content.join('\n');
};

/**
 * Get chat history for a resume
 * @route GET /api/chat/:resumeId
 */
const getChatHistory = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find resume to validate ownership
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

    // Find chat
    const chat = await Chat.findOne({
      resumeId,
      userId: req.user._id
    });

    if (!chat) {
      return res.status(200).json({
        status: 'success',
        data: {
          messages: []
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        messages: chat.messages
      }
    });
  } catch (error) {
    console.error('Error in getChatHistory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error fetching chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Clear chat history for a resume
 * @route DELETE /api/chat/:resumeId
 */
const clearChatHistory = async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Find and delete chat
    await Chat.findOneAndDelete({
      resumeId,
      userId: req.user._id
    });

    res.status(200).json({
      status: 'success',
      message: 'Chat history cleared successfully'
    });
  } catch (error) {
    console.error('Error in clearChatHistory:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error clearing chat history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  sendMessage,
  getChatHistory,
  clearChatHistory
}; 