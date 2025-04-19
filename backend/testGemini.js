// Test the Gemini API connection
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  try {
    console.log("Testing Gemini API connection...");
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("No API key found in environment variables");
      process.exit(1);
    }
    
    console.log("API Key:", apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 3));
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log("Requesting content from model: gemini-1.5-flash");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    
    console.log("Gemini API is working!");
    console.log("Response:", text.substring(0, 100) + "...");
    return true;
  } catch (error) {
    console.error("Gemini API test failed with error:");
    console.error(error);
    return false;
  }
}

// Run the test
testGeminiAPI()
  .then((success) => {
    console.log("Test completed " + (success ? "successfully." : "with errors."));
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error("Test failed with unhandled error:", err);
    process.exit(1);
  }); 