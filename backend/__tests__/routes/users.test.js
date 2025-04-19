const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const { createTestUser, cleanupTestData } = require('../testUtils');
const bcrypt = require('bcrypt');

describe('User Routes', () => {
  // Clean up after tests
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Check response structure
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).toHaveProperty('token');

      // Verify user was created in the database
      const user = await User.findById(response.body.data.userId);
      expect(user).toBeTruthy();
      expect(user.email).toBe(userData.email);
    });

    it('should not register a user with invalid email', async () => {
      const userData = {
        email: 'invalidemail',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toHaveProperty('email');
    });

    it('should not register a user with short password', async () => {
      const userData = {
        email: 'valid@example.com',
        password: 'short'
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.errors).toHaveProperty('password');
    });

    it('should not register a duplicate user', async () => {
      const userData = {
        email: 'duplicate@example.com',
        password: 'password123'
      };

      // Create a user first
      await User.create({
        email: userData.email,
        passwordHash: await bcrypt.hash(userData.password, 10)
      });

      // Try to create the same user again
      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a user with valid credentials', async () => {
      const password = 'password123';
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: 'logintest@example.com',
        passwordHash
      });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: user.email,
          password
        })
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email', user.email);
    });

    it('should not login with incorrect password', async () => {
      const user = await User.create({
        email: 'badpassword@example.com',
        passwordHash: await bcrypt.hash('correctpassword', 10)
      });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: user.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'somepassword'
        })
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/users/me', () => {
    it('should get user profile with valid token', async () => {
      const { user, token } = await createTestUser();

      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('email', user.email);
      expect(response.body.data).not.toHaveProperty('passwordHash');
    });

    it('should reject requests without a token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('token');
    });

    it('should reject requests with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('Invalid token');
    });
  });
}); 