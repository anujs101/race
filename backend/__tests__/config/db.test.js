const mongoose = require('mongoose');
const connectDB = require('../../../config/db');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

// Mock process.exit to prevent test from exiting
jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Connection', () => {
  let consoleSpy;
  let errorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console.log and console.error
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original console methods
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should connect to MongoDB using the environment URI', async () => {
    // Set test environment variable
    const originalMongoUri = process.env.MONGO_URI;
    process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
    
    // Mock successful mongoose connection
    const mockConnection = {
      connection: { host: 'localhost' }
    };
    mongoose.connect.mockResolvedValue(mockConnection);
    
    // Execute the function
    const result = await connectDB();
    
    // Verify mongoose.connect was called with correct URI
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    
    // Verify success message was logged
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('MongoDB Connected: localhost')
    );
    
    // Verify the function returns the connection
    expect(result).toEqual(mockConnection);
    
    // Restore original environment variable
    process.env.MONGO_URI = originalMongoUri;
  });
  
  it('should handle connection errors gracefully', async () => {
    // Set test environment variable
    const originalMongoUri = process.env.MONGO_URI;
    process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
    
    // Mock mongoose connection failure
    const connectionError = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(connectionError);
    
    // Execute the function
    await connectDB();
    
    // Verify error was logged
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error: Connection failed')
    );
    
    // Verify process.exit was called with error code 1
    expect(process.exit).toHaveBeenCalledWith(1);
    
    // Restore original environment variable
    process.env.MONGO_URI = originalMongoUri;
  });
  
  it('should exit with error code when MONGO_URI is not defined', async () => {
    // Save and remove the environment variable
    const originalMongoUri = process.env.MONGO_URI;
    delete process.env.MONGO_URI;
    
    // Mock mongoose connect to throw error about missing URI
    const uriError = new Error('Invalid connection string');
    mongoose.connect.mockRejectedValue(uriError);
    
    // Execute the function
    await connectDB();
    
    // Verify error was logged
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Error: Invalid connection string')
    );
    
    // Verify process.exit was called with error code 1
    expect(process.exit).toHaveBeenCalledWith(1);
    
    // Restore original environment variable
    process.env.MONGO_URI = originalMongoUri;
  });
});
