const mongoose = require('mongoose');
const { 
  extractTextFromPDF,
  enhanceResume,
  generateCoverLetter,
  scoreResumeATS,
  chatWithResume
} = require('../../utils/resumeUtils');

// Mock the PDF parser
jest.mock('pdf-parse', () => 
  jest.fn().mockImplementation(() => 
    Promise.resolve({
      text: 'Mocked resume text content'
    })
  )
);

// Mock Gemini API responses
jest.mock('@google/generative-ai', () => {
  const mockGenText = jest.fn();
  
  // Default implementation returns success
  mockGenText.mockResolvedValue({
    response: {
      text: () => 'Mocked AI response'
    }
  });
  
  return {
    GoogleGenerativeAI: jest.fn(() => ({
      getGenerativeModel: jest.fn(() => ({
        generateContent: mockGenText
      }))
    })),
    mockGenerateContent: mockGenText
  };
});

describe('Resume Utilities', () => {
  describe('extractTextFromPDF', () => {
    it('extracts text from a PDF buffer', async () => {
      const mockBuffer = Buffer.from('mock pdf content');
      const result = await extractTextFromPDF(mockBuffer);
      
      expect(result).toBe('Mocked resume text content');
    });
    
    it('throws an error when PDF parsing fails', async () => {
      const pdfParse = require('pdf-parse');
      pdfParse.mockRejectedValueOnce(new Error('PDF parsing failed'));
      
      const mockBuffer = Buffer.from('mock pdf content');
      await expect(extractTextFromPDF(mockBuffer)).rejects.toThrow('Error extracting text from PDF');
    });
  });
  
  describe('enhanceResume', () => {
    it('enhances resume content using Gemini AI', async () => {
      const resumeText = 'Original resume content';
      const result = await enhanceResume(resumeText);
      
      expect(result).toBe('Mocked AI response');
    });
    
    it('throws an error when AI enhancement fails', async () => {
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockRejectedValueOnce(new Error('AI processing failed'));
      
      await expect(enhanceResume('resume text')).rejects.toThrow('Error enhancing resume');
    });
  });
  
  describe('generateCoverLetter', () => {
    it('generates a cover letter using resume and job details', async () => {
      const resumeText = 'Resume content';
      const jobDetails = {
        jobTitle: 'Software Engineer',
        company: 'Tech Company',
        jobDescription: 'Job description text'
      };
      
      const result = await generateCoverLetter(resumeText, jobDetails);
      expect(result).toBe('Mocked AI response');
    });
    
    it('throws an error when cover letter generation fails', async () => {
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockRejectedValueOnce(new Error('Cover letter generation failed'));
      
      const jobDetails = {
        jobTitle: 'Software Engineer',
        company: 'Tech Company',
        jobDescription: 'Job description text'
      };
      
      await expect(generateCoverLetter('resume text', jobDetails))
        .rejects.toThrow('Error generating cover letter');
    });
  });
  
  describe('scoreResumeATS', () => {
    it('scores resume for ATS compatibility', async () => {
      const resumeText = 'Resume content';
      const jobDescription = 'Job description text';
      
      const result = await scoreResumeATS(resumeText, jobDescription);
      expect(result).toBe('Mocked AI response');
    });
    
    it('throws an error when ATS scoring fails', async () => {
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockRejectedValueOnce(new Error('ATS scoring failed'));
      
      await expect(scoreResumeATS('resume text', 'job description'))
        .rejects.toThrow('Error scoring resume for ATS compatibility');
    });
  });
  
  describe('chatWithResume', () => {
    it('sends message to chat with resume context', async () => {
      const resumeText = 'Resume content';
      const message = 'How can I improve my resume?';
      const chatHistory = [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ];
      
      const result = await chatWithResume(resumeText, message, chatHistory);
      expect(result).toBe('Mocked AI response');
    });
    
    it('throws an error when chat fails', async () => {
      const { mockGenerateContent } = require('@google/generative-ai');
      mockGenerateContent.mockRejectedValueOnce(new Error('Chat processing failed'));
      
      await expect(chatWithResume('resume text', 'message', []))
        .rejects.toThrow('Error processing chat with resume');
    });
  });
}); 