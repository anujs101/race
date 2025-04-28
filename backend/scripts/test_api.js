/**
 * Test API Endpoints
 * 
 * This script tests the resumePython API endpoint with proper JWT authentication.
 */

const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const API_URL = process.env.API_URL || 'http://localhost:5001/api';

// Create a test user for authentication
const testUser = {
  _id: '60d0fe4f5311236168a109ca', // Fake MongoDB ObjectId
  email: 'test@example.com',
  name: 'Test User'
};

// Create a JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Test the resume-python endpoint
const testResumePythonEndpoint = async (resumeId) => {
  try {
    // Generate token
    const token = generateToken(testUser);
    console.log('Generated JWT token:', token);
    
    // API URL
    const url = `${API_URL}/resume/enhance-python/${resumeId}`;
    console.log('Testing endpoint:', url);
    
    // Make the request
    const response = await axios.post(url, {}, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('Error testing endpoint:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    // Get resume ID from command line or use a default
    const resumeId = process.argv[2] || '680e2d94dac8026cc0063bb1';
    
    console.log(`Testing resumePython endpoint with resume ID: ${resumeId}`);
    
    // Test the endpoint
    await testResumePythonEndpoint(resumeId);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
};

// Run the main function
main(); 