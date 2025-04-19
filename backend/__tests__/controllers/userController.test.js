const mongoose = require('mongoose');
const httpMocks = require('node-mocks-http');
const { 
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser
} = require('../../controllers/userController');
const User = require('../../models/userModel');
const generateToken = require('../../utils/generateToken');

// Mock the User model and generateToken utility
jest.mock('../../models/userModel');
jest.mock('../../utils/generateToken');

describe('User Controller', () => {
  let req, res, next;
  
  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authUser', () => {
    it('should authenticate user and return token', async () => {
      // Mock data
      const userData = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      
      // Mock token generation
      generateToken.mockReturnValue('mockedtoken123');
      
      // Mock User.findOne
      User.findOne = jest.fn().mockResolvedValue(userData);
      
      // Set request body
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      await authUser(req, res, next);
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isAdmin: undefined, // Not specified in mock data
        token: 'mockedtoken123'
      });
    });
    
    it('should return 401 for invalid password', async () => {
      // Mock user with failed password match
      const userData = {
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      
      // Mock User.findOne
      User.findOne = jest.fn().mockResolvedValue(userData);
      
      // Set request body
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      await authUser(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Invalid email or password');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
    
    it('should return 401 for user not found', async () => {
      // Mock User.findOne for user not found
      User.findOne = jest.fn().mockResolvedValue(null);
      
      // Set request body
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      await authUser(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('Invalid email or password');
      expect(next.mock.calls[0][0].statusCode).toBe(401);
    });
  });
  
  describe('registerUser', () => {
    it('should register a new user', async () => {
      // Mock user data
      const userData = {
        _id: 'newuser1',
        name: 'New User',
        email: 'newuser@example.com',
        password: 'hashedpassword',
        isAdmin: false
      };
      
      // Mock User.findOne and User.create
      User.findOne = jest.fn().mockResolvedValue(null);
      User.create = jest.fn().mockResolvedValue(userData);
      
      // Mock token generation
      generateToken.mockReturnValue('newusertoken123');
      
      // Set request body
      req.body = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123'
      };
      
      await registerUser(req, res, next);
      
      // Verify response
      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toEqual({
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        isAdmin: userData.isAdmin,
        token: 'newusertoken123'
      });
    });
    
    it('should return 400 if user already exists', async () => {
      // Mock existing user
      const existingUser = {
        email: 'existing@example.com'
      };
      
      // Mock User.findOne
      User.findOne = jest.fn().mockResolvedValue(existingUser);
      
      // Set request body
      req.body = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      await registerUser(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('User already exists');
      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });
  
  describe('getUserProfile', () => {
    it('should return user profile for authenticated user', async () => {
      // Mock authenticated user
      const userData = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com',
        isAdmin: false
      };
      
      // Set authenticated user in request
      req.user = userData;
      
      await getUserProfile(req, res, next);
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(userData);
    });
  });
  
  describe('updateUserProfile', () => {
    it('should update user profile', async () => {
      // Mock user data
      const existingUser = {
        _id: 'user1',
        name: 'Original Name',
        email: 'original@example.com',
        password: 'hashedpassword',
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        })
      };
      
      // Set authenticated user and update data
      req.user = existingUser;
      req.body = {
        name: 'Updated Name',
        email: 'updated@example.com',
        password: 'newpassword123'
      };
      
      // Mock token generation
      generateToken.mockReturnValue('updatedtoken123');
      
      await updateUserProfile(req, res, next);
      
      // Verify user object was updated
      expect(existingUser.name).toBe('Updated Name');
      expect(existingUser.email).toBe('updated@example.com');
      
      // Verify user was saved
      expect(existingUser.save).toHaveBeenCalled();
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({
        _id: existingUser._id,
        name: 'Updated Name',
        email: 'updated@example.com',
        isAdmin: undefined, // Not in our mock data
        token: 'updatedtoken123'
      });
    });
  });
  
  describe('getUsers', () => {
    it('should return all users for admin', async () => {
      // Mock users data
      const users = [
        { _id: 'user1', name: 'User 1', email: 'user1@example.com' },
        { _id: 'user2', name: 'User 2', email: 'user2@example.com' }
      ];
      
      // Mock User.find
      User.find = jest.fn().mockResolvedValue(users);
      
      await getUsers(req, res, next);
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(users);
    });
    
    it('should handle errors', async () => {
      // Mock error
      const errorMessage = 'Database error';
      User.find = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      await getUsers(req, res, next);
      
      // Verify error is passed to next middleware
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe(errorMessage);
    });
  });
  
  describe('deleteUser', () => {
    it('should delete user by ID', async () => {
      // Mock user
      const user = {
        _id: 'user1',
        name: 'User to Delete',
        remove: jest.fn().mockResolvedValue(true)
      };
      
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(user);
      
      // Set params
      req.params = { id: 'user1' };
      
      await deleteUser(req, res, next);
      
      // Verify user was deleted
      expect(user.remove).toHaveBeenCalled();
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual({ message: 'User removed' });
    });
    
    it('should return 404 if user not found', async () => {
      // Mock user not found
      User.findById = jest.fn().mockResolvedValue(null);
      
      // Set params
      req.params = { id: 'nonexistent' };
      
      await deleteUser(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('User not found');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('getUserById', () => {
    it('should return user by ID', async () => {
      // Mock user
      const user = {
        _id: 'user1',
        name: 'Test User',
        email: 'test@example.com'
      };
      
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(user);
      
      // Set params
      req.params = { id: 'user1' };
      
      await getUserById(req, res, next);
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(user);
    });
    
    it('should return 404 if user not found', async () => {
      // Mock user not found
      User.findById = jest.fn().mockResolvedValue(null);
      
      // Set params
      req.params = { id: 'nonexistent' };
      
      await getUserById(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('User not found');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
  
  describe('updateUser', () => {
    it('should update user by ID', async () => {
      // Mock user
      const user = {
        _id: 'user1',
        name: 'Original Name',
        email: 'original@example.com',
        isAdmin: false,
        save: jest.fn().mockImplementation(function() {
          return Promise.resolve(this);
        })
      };
      
      // Mock User.findById
      User.findById = jest.fn().mockResolvedValue(user);
      
      // Set params and body
      req.params = { id: 'user1' };
      req.body = {
        name: 'Updated Name',
        email: 'updated@example.com',
        isAdmin: true
      };
      
      await updateUser(req, res, next);
      
      // Verify user was updated
      expect(user.name).toBe('Updated Name');
      expect(user.email).toBe('updated@example.com');
      expect(user.isAdmin).toBe(true);
      
      // Verify user was saved
      expect(user.save).toHaveBeenCalled();
      
      // Verify response
      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toEqual(user);
    });
    
    it('should return 404 if user not found', async () => {
      // Mock user not found
      User.findById = jest.fn().mockResolvedValue(null);
      
      // Set params
      req.params = { id: 'nonexistent' };
      
      await updateUser(req, res, next);
      
      // Verify error handling
      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].message).toBe('User not found');
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });
}); 