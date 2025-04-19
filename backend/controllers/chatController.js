const Chat = require('../models/Chat');
const Resume = require('../models/Resume');
const { generateChatResponse } = require('../utils/gemini');
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
    });

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

    // Get latest resume version text
    const latestVersion = resume.versions.length > 0 
      ? resume.versions[resume.versions.length - 1].text 
      : resume.originalText;

    // Generate response from Gemini
    const botResponse = await generateChatResponse(chat.messages, latestVersion);

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