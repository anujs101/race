// Global setup for Jest tests
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Set up environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.GEMINI_API_KEY = 'test-gemini-api-key';
process.env.PORT = 5001;

// Mock utilities that require external APIs
jest.mock('./utils/gemini', () => ({
  createEnhancement: jest.fn().mockResolvedValue({
    enhancedText: 'Enhanced resume text',
    latexText: '\\documentclass{article}\\begin{document}Enhanced resume text\\end{document}'
  }),
  generateChatResponse: jest.fn().mockResolvedValue('Generated chat response'),
  generateCoverLetter: jest.fn().mockResolvedValue('Generated cover letter'),
  scoreATSCompatibility: jest.fn().mockResolvedValue({
    score: 85,
    feedback: ['Good resume', 'Add more keywords']
  })
}));

jest.mock('./utils/extract', () => ({
  extractTextFromPDF: jest.fn().mockResolvedValue('Extracted PDF text'),
  structureResumeData: jest.fn().mockResolvedValue({
    personalInfo: { name: 'John Doe', email: 'john@example.com' },
    skills: ['JavaScript', 'Node.js', 'MongoDB']
  })
}));

// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Disconnect from MongoDB and stop server after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Silence console logs during tests
global.console.log = jest.fn();
global.console.info = jest.fn();
// Keep error logs for debugging
// global.console.error = jest.fn(); 