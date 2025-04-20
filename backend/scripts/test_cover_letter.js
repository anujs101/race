/**
 * Test script for Cover Letter Generator
 * This script tests the Python bridge and cover letter generation functionality
 */

const { executePythonScript } = require('../utils/pythonBridge');
const path = require('path');

// Path to the Python script
const COVER_LETTER_SCRIPT = path.join(__dirname, 'cover_letter_generator.py');

// Sample resume text for testing
const SAMPLE_RESUME = `
John Doe
Software Engineer
123 Main St, San Francisco, CA
johndoe@example.com | (123) 456-7890

EXPERIENCE
Senior Software Engineer, Tech Company (2018-Present)
- Developed and maintained web applications using React, Node.js, and MongoDB
- Led a team of 5 developers on a project that increased user engagement by 35%

Software Developer, Startup Inc. (2015-2018)
- Built RESTful APIs using Express.js and integrated with third-party services
- Implemented CI/CD pipelines that reduced deployment time by 50%

EDUCATION
Bachelor of Science in Computer Science, University of Technology (2011-2015)

SKILLS
Programming: JavaScript, Python, Java, SQL
Frameworks: React, Node.js, Express, Django
Tools: Git, Docker, AWS, Jenkins
`;

// Sample job details for testing
const JOB_TITLE = "Full Stack Developer";
const COMPANY_NAME = "Example Corp";
const JOB_DESCRIPTION = `
We are looking for a Full Stack Developer to join our engineering team. 
The ideal candidate has experience with JavaScript, React, Node.js, and database technologies.
Responsibilities include:
- Developing and maintaining web applications
- Writing clean, maintainable code
- Collaborating with cross-functional teams
- Troubleshooting and debugging issues
`;

// Test cases
const runTests = async () => {
  console.log('Starting cover letter generator tests...\n');

  // Test Case 1: Basic Cover Letter Generation
  console.log('==== Test Case 1: Basic Cover Letter Generation ====');
  console.log(`Generating cover letter for "${JOB_TITLE}" at ${COMPANY_NAME}...`);
  
  try {
    const result = await executePythonScript(COVER_LETTER_SCRIPT, {
      resumeText: SAMPLE_RESUME,
      jobTitle: JOB_TITLE,
      companyName: COMPANY_NAME,
      jobDescription: JOB_DESCRIPTION
    });
    
    if (result.status === 'success' && result.data && result.data.coverLetter) {
      console.log('✅ Success! Cover letter generated.');
      console.log('Cover letter preview:');
      const preview = result.data.coverLetter.substring(0, 150) + '...';
      console.log(preview);
      console.log('\nMetadata:', result.data.metadata);
    } else {
      console.log('❌ Failed to generate cover letter:', result.message || 'Unknown error');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('\n');
  
  // Test Case 2: Error Handling (Missing Parameters)
  console.log('==== Test Case 2: Error Handling (Missing Parameters) ====');
  console.log('Testing with missing job description...');
  
  try {
    const result = await executePythonScript(COVER_LETTER_SCRIPT, {
      resumeText: SAMPLE_RESUME,
      jobTitle: JOB_TITLE,
      companyName: COMPANY_NAME,
      // jobDescription is intentionally omitted
    });
    
    if (result.status === 'error' && result.message.includes('Missing required parameters')) {
      console.log(`✅ Correctly returned error: ${result.message}`);
    } else {
      console.log('❌ Failed to handle missing parameters properly');
      console.log('Result:', result);
    }
  } catch (error) {
    if (error.message.includes('Missing required parameters')) {
      console.log(`✅ Correctly threw error: ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error.message);
    }
  }
  
  console.log('\n');
  
  // Test Case 3: Error Handling (Python Script Errors)
  console.log('==== Test Case 3: Error Handling (Python Script Errors) ====');
  console.log('Testing with malformed resume text...');
  
  try {
    const result = await executePythonScript(COVER_LETTER_SCRIPT, {
      resumeText: null, // Intentionally providing null
      jobTitle: JOB_TITLE,
      companyName: COMPANY_NAME,
      jobDescription: JOB_DESCRIPTION
    });
    
    if (result.status === 'error') {
      console.log(`✅ Correctly handled error with null resume text: ${result.message}`);
    } else {
      console.log('❌ Failed to handle null resume text properly');
      console.log('Result:', result);
    }
  } catch (error) {
    console.log(`✅ Correctly threw error with null resume text: ${error.message}`);
  }
  
  console.log('\nAll tests completed.');
};

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
}); 