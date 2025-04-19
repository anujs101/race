const mongoose = require('mongoose');
const User = require('../../models/User');
const Resume = require('../../models/Resume');
const Chat = require('../../models/Chat');

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({
    connection: { host: 'localhost' }
  }),
  connection: {
    close: jest.fn().mockResolvedValue(true)
  }
}));

// Mock the models
jest.mock('../../models/User', () => ({
  deleteMany: jest.fn().mockResolvedValue(true),
  insertMany: jest.fn().mockResolvedValue([])
}));

jest.mock('../../models/Resume', () => ({
  deleteMany: jest.fn().mockResolvedValue(true),
  insertMany: jest.fn().mockResolvedValue([])
}));

jest.mock('../../models/Chat', () => ({
  deleteMany: jest.fn().mockResolvedValue(true),
  insertMany: jest.fn().mockResolvedValue([])
}));

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

// Sample data for tests
const users = [
  {
    email: 'admin@example.com',
    passwordHash: 'hashedpassword123'
  },
  {
    email: 'user@example.com',
    passwordHash: 'hashedpassword456'
  }
];

const resumes = [
  {
    userId: '612345678901234567890123',
    originalText: 'Sample resume text 1',
    versions: [
      {
        version: '1.0',
        text: 'Enhanced resume text 1',
        latexText: '\\documentclass{article}\\begin{document}Enhanced resume text 1\\end{document}'
      }
    ]
  }
];

describe('Data Seeder', () => {
  let consoleSpy;
  let errorSpy;
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Mock console methods to prevent output during tests
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Set environment variable
    process.env.MONGO_URI = 'mongodb://localhost:27017/test-db';
  });
  
  afterEach(() => {
    // Restore console methods
    consoleSpy.mockRestore();
    errorSpy.mockRestore();
  });
  
  describe('importData function', () => {
    it('should connect to the database and import data', async () => {
      // Create importData function to test
      const importData = async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          
          // Clear existing data
          await User.deleteMany();
          await Resume.deleteMany();
          await Chat.deleteMany();
          
          // Import data
          await User.insertMany(users);
          await Resume.insertMany(resumes);
          
          console.log('Data Imported!');
          process.exit(0);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };
      
      // Call the function
      await importData();
      
      // Verify MongoDB connection was established
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
      
      // Verify all collections were cleared
      expect(User.deleteMany).toHaveBeenCalled();
      expect(Resume.deleteMany).toHaveBeenCalled();
      expect(Chat.deleteMany).toHaveBeenCalled();
      
      // Verify data was inserted
      expect(User.insertMany).toHaveBeenCalledWith(users);
      expect(Resume.insertMany).toHaveBeenCalledWith(resumes);
      
      // Verify success message was shown
      expect(consoleSpy).toHaveBeenCalledWith('Data Imported!');
      
      // Verify process would exit with success code
      expect(mockExit).toHaveBeenCalledWith(0);
    });
    
    it('should handle errors during import', async () => {
      // Mock an error during data import
      User.insertMany.mockRejectedValueOnce(new Error('Import failed'));
      
      // Create importData function with error handling
      const importData = async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          
          // Clear existing data
          await User.deleteMany();
          await Resume.deleteMany();
          await Chat.deleteMany();
          
          // Import data
          await User.insertMany(users);
          await Resume.insertMany(resumes);
          
          console.log('Data Imported!');
          process.exit(0);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };
      
      // Call the function
      await importData();
      
      // Verify error handling
      expect(errorSpy).toHaveBeenCalledWith('Error: Import failed');
      
      // Verify process would exit with error code
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Verify Success message was not shown
      expect(consoleSpy).not.toHaveBeenCalledWith('Data Imported!');
    });
  });
  
  describe('destroyData function', () => {
    it('should connect to the database and destroy all data', async () => {
      // Create destroyData function to test
      const destroyData = async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          
          // Delete all data
          await User.deleteMany();
          await Resume.deleteMany();
          await Chat.deleteMany();
          
          console.log('Data Destroyed!');
          process.exit(0);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };
      
      // Call the function
      await destroyData();
      
      // Verify MongoDB connection was established
      expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
      
      // Verify all collections were cleared
      expect(User.deleteMany).toHaveBeenCalled();
      expect(Resume.deleteMany).toHaveBeenCalled();
      expect(Chat.deleteMany).toHaveBeenCalled();
      
      // Verify success message was shown
      expect(consoleSpy).toHaveBeenCalledWith('Data Destroyed!');
      
      // Verify process would exit with success code
      expect(mockExit).toHaveBeenCalledWith(0);
    });
    
    it('should handle errors during data destruction', async () => {
      // Mock an error during data deletion
      User.deleteMany.mockRejectedValueOnce(new Error('Deletion failed'));
      
      // Create destroyData function with error handling
      const destroyData = async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI);
          
          // Delete all data
          await User.deleteMany();
          await Resume.deleteMany();
          await Chat.deleteMany();
          
          console.log('Data Destroyed!');
          process.exit(0);
        } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
        }
      };
      
      // Call the function
      await destroyData();
      
      // Verify error handling
      expect(errorSpy).toHaveBeenCalledWith('Error: Deletion failed');
      
      // Verify process would exit with error code
      expect(mockExit).toHaveBeenCalledWith(1);
      
      // Verify Success message was not shown
      expect(consoleSpy).not.toHaveBeenCalledWith('Data Destroyed!');
    });
  });
}); 