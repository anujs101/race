/**
 * Python Bridge Tests
 * 
 * Tests for the Python bridge functionality.
 */

const { executePythonFunction } = require('../utils/pythonBridge');
const { spawn } = require('child_process');

// Mock the child_process spawn function
jest.mock('child_process', () => ({
  spawn: jest.fn()
}));

// Mock fs.promises
jest.mock('fs', () => ({
  promises: {
    access: jest.fn().mockResolvedValue(true)
  }
}));

// Mock logger
jest.mock('../utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}));

describe('Python Bridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('executePythonFunction', () => {
    it('should execute a Python function successfully', async () => {
      // Mock the spawn implementation
      const mockStdout = {
        on: jest.fn()
      };
      
      const mockStderr = {
        on: jest.fn()
      };
      
      const mockProcess = {
        stdout: mockStdout,
        stderr: mockStderr,
        on: jest.fn()
      };
      
      // Mock implementation of spawn
      spawn.mockReturnValue(mockProcess);
      
      // Add event listeners
      mockStdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('{"result": "success"}'));
        }
        return mockStdout;
      });
      
      mockStderr.on.mockImplementation((event, callback) => {
        return mockStderr;
      });
      
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Exit code 0 (success)
        }
        return mockProcess;
      });
      
      // Execute the function
      const result = await executePythonFunction('testFunction', { test: 'data' });
      
      // Verify spawn was called correctly
      expect(spawn).toHaveBeenCalledWith('python3', [
        expect.stringContaining('enhancer_wrapper.py'),
        '--function', 'testFunction',
        '--data', '{"test":"data"}'
      ]);
      
      // Verify the result
      expect(result).toEqual({ result: 'success' });
    });
    
    it('should handle Python process errors', async () => {
      // Mock spawn implementation
      const mockStdout = {
        on: jest.fn()
      };
      
      const mockStderr = {
        on: jest.fn()
      };
      
      const mockProcess = {
        stdout: mockStdout,
        stderr: mockStderr,
        on: jest.fn()
      };
      
      spawn.mockReturnValue(mockProcess);
      
      // Add event listeners
      mockStdout.on.mockReturnValue(mockStdout);
      
      mockStderr.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Error: Python error'));
        }
        return mockStderr;
      });
      
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(1); // Exit code 1 (error)
        }
        return mockProcess;
      });
      
      // Execute the function and expect it to reject
      await expect(executePythonFunction('testFunction', { test: 'data' }))
        .rejects.toThrow('Python process failed with error');
    });
    
    it('should handle invalid JSON responses', async () => {
      // Mock spawn implementation
      const mockStdout = {
        on: jest.fn()
      };
      
      const mockStderr = {
        on: jest.fn()
      };
      
      const mockProcess = {
        stdout: mockStdout,
        stderr: mockStderr,
        on: jest.fn()
      };
      
      spawn.mockReturnValue(mockProcess);
      
      // Add event listeners
      mockStdout.on.mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('Invalid JSON'));
        }
        return mockStdout;
      });
      
      mockStderr.on.mockReturnValue(mockStderr);
      
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'close') {
          callback(0); // Exit code 0 (success)
        }
        return mockProcess;
      });
      
      // Execute the function
      const result = await executePythonFunction('testFunction', { test: 'data' });
      
      // Verify the result contains the raw output
      expect(result).toHaveProperty('rawOutput', 'Invalid JSON');
    });
    
    it('should handle process spawn errors', async () => {
      // Mock process.on to simulate an error event
      const mockProcess = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      };
      
      spawn.mockReturnValue(mockProcess);
      
      // Simulate error event
      mockProcess.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          callback(new Error('Failed to spawn process'));
        }
        return mockProcess;
      });
      
      // Execute the function and expect it to reject
      await expect(executePythonFunction('testFunction', { test: 'data' }))
        .rejects.toThrow('Failed to start Python process');
    });
  });
}); 