const mongoose = require('mongoose');
const connectDB = require('../../config/db');

jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Connection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.log = jest.fn();
    console.error = jest.fn();
  });
  
  afterEach(() => {
    mockExit.mockReset();
  });

  it('should connect to MongoDB using the correct URI', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    
    mongoose.connect.mockResolvedValue({
      connection: { host: 'localhost' }
    });
    
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
  });
  
  it('should handle connection errors', async () => {
    process.env.MONGO_URI = 'mongodb://localhost:27017/test';
    
    const error = new Error('Connection failed');
    mongoose.connect.mockRejectedValue(error);
    
    await connectDB();
    
    expect(console.error).toHaveBeenCalledWith(`Error: ${error.message}`);
    expect(process.exit).toHaveBeenCalledWith(1);
  });
}); 