/**
 * Simple test script for LaTeX to PDF conversion
 */
const { isLatexContent, extractLatexContent, convertLatexToPdf } = require('./utils/latexToPdf');
const fs = require('fs');
const path = require('path');

// Sample LaTeX content
const sampleLatexContent = `
\\documentclass{article}
\\usepackage[utf8]{inputenc}
\\usepackage{hyperref}

\\begin{document}

\\begin{center}
{\\Large \\textbf{John Doe}}\\\\
Software Developer\\\\
john.doe@example.com | 555-123-4567 | New York, NY
\\end{center}

\\section*{Education}
\\begin{itemize}
  \\item \\textbf{Bachelor of Science in Computer Science} | Example University | 2018-2022
\\end{itemize}

\\section*{Experience}
\\begin{itemize}
  \\item \\textbf{Software Developer} | Example Corp | 2022-Present \\\\
  Developed web applications using React, Node.js, and MongoDB.
\\end{itemize}

\\section*{Skills}
\\begin{itemize}
  \\item JavaScript, TypeScript, React, Node.js, MongoDB, SQL
\\end{itemize}

\\end{document}
`;

// Test the LaTeX detection and extraction functions
function testDetectionAndExtraction() {
  console.log('Testing LaTeX detection and extraction...');
  
  // Case 1: Plain LaTeX content
  const isLatex1 = isLatexContent(sampleLatexContent);
  console.log('Is sample content LaTeX?', isLatex1);
  
  // Case 2: LaTeX content in code block
  const codeBlockLatex = '```latex\n' + sampleLatexContent + '\n```';
  const isLatex2 = isLatexContent(codeBlockLatex);
  console.log('Is code block content LaTeX?', isLatex2);
  
  // Test extraction
  const extracted1 = extractLatexContent(sampleLatexContent);
  console.log('Extraction from plain content worked?', !!extracted1);
  
  const extracted2 = extractLatexContent(codeBlockLatex);
  console.log('Extraction from code block worked?', !!extracted2);
  
  // Case 3: Mixed content with LaTeX
  const mixedContent = "Here's a LaTeX resume template you can use:\n\n```latex\n" + sampleLatexContent + "\n```\n\nLet me know if you need any changes!";
  const isLatex3 = isLatexContent(mixedContent);
  console.log('Is mixed content detected as LaTeX?', isLatex3);
  
  const extracted3 = extractLatexContent(mixedContent);
  console.log('Extraction from mixed content worked?', !!extracted3);
  console.log('\n');
}

// Test PDF conversion
async function testPdfConversion() {
  console.log('Testing PDF conversion...');
  
  try {
    const baseFilename = 'test_resume';
    const { base64Pdf, filename } = await convertLatexToPdf(sampleLatexContent, baseFilename);
    
    // Write the base64 PDF to a file for verification
    const outputPath = path.join(__dirname, filename);
    const pdfBuffer = Buffer.from(base64Pdf, 'base64');
    fs.writeFileSync(outputPath, pdfBuffer);
    
    console.log(`PDF conversion successful. Saved to ${outputPath}`);
    console.log(`PDF file size: ${pdfBuffer.length} bytes`);
    console.log('Conversion test passed!');
  } catch (error) {
    console.error('PDF conversion test failed:', error);
  }
}

// Run the tests
async function runTests() {
  try {
    testDetectionAndExtraction();
    await testPdfConversion();
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Test error:', error);
  }
}

runTests(); 