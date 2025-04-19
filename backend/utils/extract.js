/**
 * Text extraction utilities
 */
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Extract text from PDF file
 * @param {Buffer} pdfBuffer - PDF file buffer
 * @returns {Promise<string>} Extracted text
 */
const extractTextFromPDF = async (pdfBuffer) => {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

/**
 * Structure resume data using Gemini
 * @param {string} resumeText - Raw resume text
 * @returns {Promise<object>} Structured resume data
 */
const structureResumeData = async (resumeText) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Parse the following resume text into structured data. 
      Extract information about education, work experience, skills, and projects.
      Return the data in JSON format.
      
      Resume text:
      ${resumeText}
    `;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON from the response
    const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [null, text];
    const jsonString = jsonMatch[1];
    
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parsing JSON from Gemini response:', e);
      return { rawText: resumeText };
    }
  } catch (error) {
    console.error('Error structuring resume data:', error);
    return { rawText: resumeText };
  }
};

/**
 * Extract text from uploaded file
 * @param {Object} file - Uploaded file object with buffer and mimetype
 * @returns {Promise<string>} Extracted text
 */
async function extractTextFromFile(file) {
    if (!file || !file.buffer) {
        throw new Error("No file uploaded or invalid file");
    }

    const mimeType = file.mimetype;
    let text = '';

    if (mimeType === 'application/pdf') {
        try {
            // Extract text from PDF using pdf-parse
            const data = await pdfParse(file.buffer);
            text = data.text.trim();

            if (!text || text.length < 100) {
                console.log('PDF appears to be scanned or has minimal text. OCR would be beneficial here.');
                // If text is empty, add a placeholder message for Gemini to work with
                if (!text || text.length === 0) {
                    text = "This appears to be a scanned document with no extractable text. Please install OCR capability to fully process this document.";
                }
                // For minimal text, we'll still return it rather than throwing an error
            }
        } catch (err) {
            console.error('Error extracting text from PDF:', err);
            // For parsing errors, return a placeholder message
            return "This PDF could not be parsed properly. It may be a scanned document or image-based PDF. Please install OCR capability to process this document.";
        }
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        // For DOCX files, we would normally use mammoth
        // But for now, to avoid dependencies, we'll just return an error
        throw new Error("DOCX extraction currently unavailable. Please convert to PDF and try again.");
    } else {
        throw new Error("Unsupported file format. Please upload a PDF file.");
    }

    // Always return whatever text we found, even if it's minimal
    return text;
}

module.exports = {
    extractTextFromPDF,
    structureResumeData,
    extractTextFromFile
}; 