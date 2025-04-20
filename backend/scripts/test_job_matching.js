/**
 * Test script for job matching functionality
 * Run with: node test_job_matching.js
 */

const { executePythonScript } = require('../utils/pythonBridge');
const path = require('path');

// Path to the Python job matching script
const JOB_MATCHING_SCRIPT = path.join(__dirname, 'job_matching.py');

// Sample resume text
const SAMPLE_RESUME = `
Name: John Doe
Email: john@example.com
Phone: 123-456-7890
Address: San Francisco, CA
LinkedIn: linkedin.com/in/johndoe

Education:
- Stanford University (2018-2022), Bachelor of Science in Computer Science

Experience:
- Software Engineer at Tech Company (2022-Present): Developed and maintained web applications using React, Node.js, and MongoDB. Implemented RESTful APIs and improved system performance by 30%.
- Software Development Intern at Startup Inc. (Summer 2021): Assisted in developing frontend components using React and TypeScript.

Projects:
- E-commerce Platform: Built a full-stack e-commerce website with React, Node.js, and MongoDB.
- Personal Portfolio: Developed a responsive personal portfolio website using HTML, CSS, and JavaScript.

Skills: JavaScript, Python, React, Node.js, Express, MongoDB, Git, SQL, HTML, CSS, TypeScript, RESTful APIs, Agile Development
`;

// Test case 1: Basic job search without resume
async function testBasicJobSearch() {
  console.log('==== Test Case 1: Basic Job Search ====');
  
  const params = {
    jobTitle: "Software Engineer",
    location: "San Francisco",
    limit: 3
  };
  
  try {
    console.log(`Searching for "${params.jobTitle}" jobs in ${params.location}...`);
    const result = await executePythonScript(JOB_MATCHING_SCRIPT, params);
    
    if (result.status === 'success') {
      console.log(`✅ Success! Found ${result.data.matches.length} jobs.`);
      console.log('First job:', {
        title: result.data.matches[0].title,
        company: result.data.matches[0].company,
        location: result.data.matches[0].location
      });
    } else {
      console.log(`❌ Failed: ${result.message}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
  
  console.log('\n');
}

// Test case 2: Job search with resume for ranking
async function testResumeRanking() {
  console.log('==== Test Case 2: Job Search with Resume Ranking ====');
  
  const params = {
    resumeText: SAMPLE_RESUME,
    jobTitle: "Software Engineer",
    location: "San Francisco",
    limit: 3
  };
  
  try {
    console.log(`Searching for "${params.jobTitle}" jobs in ${params.location} with resume ranking...`);
    const result = await executePythonScript(JOB_MATCHING_SCRIPT, params);
    
    if (result.status === 'success') {
      console.log(`✅ Success! Found ${result.data.matches.length} ranked jobs.`);
      
      // Show top match with similarity score
      const topMatch = result.data.matches[0];
      console.log('Top match:', {
        title: topMatch.title,
        company: topMatch.company,
        similarityScore: topMatch.similarityScore
      });
      
      // Verify jobs are ranked by similarity score
      if (result.data.matches.length >= 2) {
        if (result.data.matches[0].similarityScore >= result.data.matches[1].similarityScore) {
          console.log('✅ Jobs are correctly ranked by similarity score.');
        } else {
          console.log('❌ Jobs are not correctly ranked by similarity score.');
        }
      }
    } else {
      console.log(`❌ Failed: ${result.message}`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
  
  console.log('\n');
}

// Test case 3: Error handling for invalid input
async function testErrorHandling() {
  console.log('==== Test Case 3: Error Handling ====');
  
  const params = {
    // Missing jobTitle
    location: "San Francisco",
    limit: 3
  };
  
  try {
    console.log('Testing with missing job title...');
    const result = await executePythonScript(JOB_MATCHING_SCRIPT, params);
    
    if (result.status === 'error') {
      console.log(`✅ Correctly returned error: ${result.message}`);
    } else {
      console.log('❌ Failed: Should have returned an error for missing job title.');
    }
  } catch (error) {
    console.log(`✅ Correctly threw error: ${error.message}`);
  }
  
  console.log('\n');
}

// Run all tests
async function runTests() {
  console.log('Starting job matching tests...\n');
  
  try {
    await testBasicJobSearch();
    await testResumeRanking();
    await testErrorHandling();
    
    console.log('All tests completed.');
  } catch (error) {
    console.error('Test suite error:', error);
  }
}

// Execute tests
runTests(); 