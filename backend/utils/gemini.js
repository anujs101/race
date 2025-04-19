const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get a Gemini model
 * @returns {Promise<*>} The Gemini model
 */
const getGeminiModel = async () => {
  try {
    return genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  } catch (error) {
    console.error('Error initializing Gemini model:', error);
    throw new Error('Failed to initialize Gemini API');
  }
};

/**
 * Create enhanced resume using Gemini AI
 * @param {string} resumeText - Original resume text
 * @returns {Promise<{enhancedText: string, latexText: string}>} Enhanced resume text
 */
const createEnhancement = async (resumeText) => {
  try {
    const model = await getGeminiModel();
    
    const prompt = `
    You are a professional resume enhancer.
    Analyze the following resume text and improve it by:
    1. Making action verbs stronger and more impactful
    2. Quantifying achievements where possible
    3. Removing filler words and unnecessary content
    4. Enhancing clarity and readability
    5. Ensuring proper formatting and consistent tense
    
    Original Resume Text:
    ${resumeText}
    
    Provide only the enhanced resume text without explanations or notes.
    `;
    
    const result = await model.generateContent(prompt);
    const enhancedText = result.response.text();

    // Generate LaTeX format
    const latexPrompt = `
    Convert the following enhanced resume text to LaTeX format:
    
    ${enhancedText}
    
    Use appropriate LaTeX resume structures and formatting. Provide ONLY the LaTeX code.
    `;
    
    const latexResult = await model.generateContent(latexPrompt);
    const latexText = latexResult.response.text();
    
    return { enhancedText, latexText };
  } catch (error) {
    console.error('Error during resume enhancement:', error);
    throw new Error('Failed to enhance resume with Gemini API');
  }
};

/**
 * Generate chat response using Gemini API
 * @param {Array} messages - Previous conversation messages
 * @param {string} resumeText - Original resume text
 * @returns {Promise<string>} Generated chat response
 */
const generateChatResponse = async (messages, resumeText) => {
  try {
    const model = await getGeminiModel();
    
    // Format messages for Gemini context
    const formattedMessages = messages.map(m => 
      `${m.role === 'user' ? 'User' : 'Bot'}: ${m.msg}`
    ).join('\n');
    
    const prompt = `
    You are RACE Bot, a resume improvement assistant.
    You help users improve their resumes with personalized advice.
    
    Original Resume:
    ${resumeText}
    
    Previous conversation:
    ${formattedMessages}
    
    Provide a helpful, professional response to continue the conversation.
    Focus on concrete, specific advice for resume improvement.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate chat response with Gemini API');
  }
};

/**
 * Generate cover letter using Gemini API
 * @param {string} resumeText - Original resume text
 * @param {Object} jobDetails - Job details for personalization
 * @returns {Promise<string>} Generated cover letter
 */
const generateCoverLetter = async (resumeText, jobDetails) => {
  try {
    const model = await getGeminiModel();
    
    const prompt = `
    You are a professional cover letter writer.
    Create a personalized cover letter based on the following resume and job details:
    
    Resume:
    ${resumeText}
    
    Job Title: ${jobDetails.title}
    Company: ${jobDetails.company}
    Job Description: ${jobDetails.description}
    
    Create a professional, tailored cover letter that highlights relevant skills and experiences from the resume.
    Format it as a proper business letter with date, address, greeting, body paragraphs, closing, and signature.
    `;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw new Error('Failed to generate cover letter with Gemini API');
  }
};

/**
 * Score resume for ATS compatibility
 * @param {string} resumeText - Resume text to score
 * @param {string} jobDescription - Job description to score against
 * @returns {Promise<{score: number, feedback: string}>} ATS score and feedback
 */
const scoreATSCompatibility = async (resumeText, jobDescription) => {
  try {
    const model = await getGeminiModel();
    
    const prompt = `
    You are an ATS (Applicant Tracking System) expert.
    Analyze the following resume against the job description and provide:
    
    1. A compatibility score from 0-100
    2. Detailed feedback on how to improve ATS compatibility
    3. Key missing keywords from the job description
    4. Formatting issues that might affect ATS scanning
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Format your response as a JSON object with fields "score" (number) and "feedback" (string array).
    `;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Extract JSON from response
    try {
      const jsonMatch = response.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[0]) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback if JSON parsing fails
      return {
        score: 50,
        feedback: [
          "Could not properly format response. Please try again.",
          response.substring(0, 500) + "..."
        ]
      };
    } catch (parseError) {
      console.error('Error parsing ATS score JSON:', parseError);
      return {
        score: 50,
        feedback: [
          "Could not properly format response. Please try again.",
          response.substring(0, 500) + "..."
        ]
      };
    }
  } catch (error) {
    console.error('Error scoring ATS compatibility:', error);
    throw new Error('Failed to score ATS compatibility with Gemini API');
  }
};

/**
 * Test the Gemini API connection
 * @returns {Promise<boolean>} True if the API is working
 */
const testGeminiAPI = async () => {
  try {
    const model = await getGeminiModel();
    // Simple test query
    const result = await model.generateContent("Hello, can you confirm this API is working?");
    const response = await result.response;
    console.log("Gemini API test response:", response.text().substring(0, 50) + "...");
    return true;
  } catch (error) {
    console.error("Gemini API test failed:", error);
    return false;
  }
};

module.exports = {
  createEnhancement,
  generateChatResponse,
  generateCoverLetter,
  scoreATSCompatibility,
  testGeminiAPI
}; 