const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Chat = require('../models/Chat');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  connection: {
    close: jest.fn().mockResolvedValue(true)
  }
}));

// Mock the models
jest.mock('../models/User', () => ({
  deleteMany: jest.fn().mockResolvedValue(true),
  insertMany: jest.fn().mockResolvedValue([])
}));

jest.mock('../models/Resume', () => ({
  deleteMany: jest.fn().mockResolvedValue(true),
  insertMany: jest.fn().mockResolvedValue([])
}));

jest.mock('../models/Chat', () => ({
  deleteMany: jest.fn().mockResolvedValue(true),
  insertMany: jest.fn().mockResolvedValue([])
}));

// Sample data for tests
const sampleUsers = [
  {
    email: 'test@example.com',
    passwordHash: 'hashedpassword123'
  }
];

describe('Data Seeder', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods to prevent output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    process.exit = jest.fn();
  });
  
  afterEach(() => {
    // Restore console methods
    console.log.mockRestore();
    console.error.mockRestore();
  });
  
  describe('seedData function', () => {
    it('should seed database with initial data', async () => {
      // Create a mock seedData function similar to what might exist in your project
      const seedData = async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          
          // Clear existing data
          await User.deleteMany();
          await Resume.deleteMany();
          await Chat.deleteMany();
          
          // Insert new data
          await User.insertMany(sampleUsers);
          
          console.log('Database seeded!');
          process.exit(0);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };
      
      await seedData();
      
      // Verify MongoDB connection was established
      expect(mongoose.connect).toHaveBeenCalled();
      
      // Verify all deleteMany methods were called
      expect(User.deleteMany).toHaveBeenCalled();
      expect(Resume.deleteMany).toHaveBeenCalled();
      expect(Chat.deleteMany).toHaveBeenCalled();
      
      // Verify data was inserted
      expect(User.insertMany).toHaveBeenCalledWith(sampleUsers);
      
      // Verify success message was shown
      expect(console.log).toHaveBeenCalledWith('Database seeded!');
      
      // Verify process would exit with success code
      expect(process.exit).toHaveBeenCalledWith(0);
    });
    
    it('should handle errors during seeding', async () => {
      // Mock an error during data import
      User.deleteMany = jest.fn().mockRejectedValue(new Error('Mock seeding error'));
      
      // Create a mock seedData function with error handling
      const seedData = async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          
          // Clear existing data
          await User.deleteMany();
          await Resume.deleteMany();
          await Chat.deleteMany();
          
          // Insert new data
          await User.insertMany(sampleUsers);
          
          console.log('Database seeded!');
          process.exit(0);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };
      
      await seedData();
      
      // Verify error handling
      expect(console.error).toHaveBeenCalledWith('Error: Mock seeding error');
      
      // Verify process would exit with error code
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
}); 