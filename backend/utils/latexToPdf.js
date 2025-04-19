/**
 * Utility for converting LaTeX content to PDF
 */
const fs = require('fs');
const path = require('path');
const latex = require('node-latex');
const crypto = require('crypto');
const os = require('os');

/**
 * Converts LaTeX content to a PDF and returns the base64 encoded result
 * @param {string} latexContent - LaTeX content to convert
 * @param {string} baseFilename - Base filename without extension
 * @returns {Promise<{base64Pdf: string, filename: string}>} Base64 encoded PDF and filename
 */
async function convertLatexToPdf(latexContent, baseFilename) {
  // Generate a unique temporary directory to handle parallel requests
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const tempDir = path.join(os.tmpdir(), `latex_${uniqueId}`);
  
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Clean filename to avoid issues
  const safeFilename = baseFilename.replace(/[^a-zA-Z0-9_-]/g, '_');
  const texFilename = `${safeFilename}.tex`;
  const pdfFilename = `${safeFilename}.pdf`;
  const texPath = path.join(tempDir, texFilename);
  const pdfPath = path.join(tempDir, pdfFilename);
  
  try {
    // Write LaTeX content to temporary file
    fs.writeFileSync(texPath, latexContent, 'utf8');
    
    // Create a promise to handle the conversion
    return new Promise((resolve, reject) => {
      // Configure LaTeX options
      const options = {
        inputs: [tempDir], // Include temp directory for resources
        cmd: 'pdflatex',   // Use pdflatex command
        passes: 1,         // Use single pass to avoid stream issues
        errorLogs: path.join(tempDir, 'errors.log')
      };
      
      // Process LaTeX to PDF using string input instead of stream
      const pdf = latex(latexContent, options);
      
      // Create a buffer to store the PDF data
      const chunks = [];
      
      // Handle compilation errors
      pdf.on('error', (err) => {
        console.error('LaTeX Error:', err);
        
        // Check if error log exists and append it to the error message
        if (fs.existsSync(options.errorLogs)) {
          const errorLog = fs.readFileSync(options.errorLogs, 'utf8');
          console.error('LaTeX Error Log:', errorLog);
        }
        
        cleanupTempFiles(tempDir);
        reject(new Error(`LaTeX compilation failed: ${err.message}`));
      });
      
      // Collect PDF data
      pdf.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      // Handle successful compilation
      pdf.on('end', () => {
        // Combine all chunks into one buffer
        const pdfBuffer = Buffer.concat(chunks);
        
        // Write to output file for verification (optional)
        fs.writeFileSync(pdfPath, pdfBuffer);
        
        // Convert to base64
        const base64Pdf = pdfBuffer.toString('base64');
        
        // Clean up temporary files
        cleanupTempFiles(tempDir);
        
        // Return the results
        resolve({
          base64Pdf,
          filename: pdfFilename
        });
      });
    });
  } catch (error) {
    // Clean up on error
    cleanupTempFiles(tempDir);
    throw error;
  }
}

/**
 * Clean up temporary files and directory
 * @param {string} tempDir - Temporary directory to clean up
 */
function cleanupTempFiles(tempDir) {
  try {
    if (fs.existsSync(tempDir)) {
      const files = fs.readdirSync(tempDir);
      for (const file of files) {
        fs.unlinkSync(path.join(tempDir, file));
      }
      fs.rmdirSync(tempDir);
    }
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
    // Continue execution even if cleanup fails
  }
}

/**
 * Check if text contains LaTeX document content
 * @param {string} text - Text to check
 * @returns {boolean} True if text appears to be LaTeX
 */
function isLatexContent(text) {
  // Check for common LaTeX patterns
  const latexPatterns = [
    /\\documentclass/i,
    /\\begin{document}/i,
    /\\end{document}/i
  ];
  
  // Return true if any pattern matches
  return latexPatterns.some(pattern => pattern.test(text));
}

/**
 * Extract LaTeX content from mixed text
 * @param {string} text - Text that might contain LaTeX content
 * @returns {string|null} Extracted LaTeX content or null if not found
 */
function extractLatexContent(text) {
  // Try to extract LaTeX content enclosed in backticks or code blocks
  const codeBlockMatch = text.match(/```(?:latex)?\s*([\s\S]*?)```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }
  
  // If no code block found but it looks like LaTeX, return the content
  if (isLatexContent(text)) {
    return text;
  }
  
  return null;
}

module.exports = {
  convertLatexToPdf,
  isLatexContent,
  extractLatexContent
}; 