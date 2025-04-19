// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.MONGO_URI = 'mongodb://localhost/test';
process.env.PORT = 5000;

// Suppress console logs during tests unless explicitly testing them
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

if (process.env.LOG_LEVEL !== 'debug') {
  global.console.log = jest.fn();
  global.console.error = jest.fn();
}

// Restore console after all tests
afterAll(() => {
  global.console.log = originalConsoleLog;
  global.console.error = originalConsoleError;
}); 