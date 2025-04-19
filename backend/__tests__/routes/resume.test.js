const request = require('supertest');
const app = require('../../app');
const fs = require('fs');
const path = require('path');
const { 
  createTestUser, 
  createTestResume, 
  cleanupTestData,
  generateObjectId 
} = require('../testUtils');

describe('Resume Routes', () => {
  let user, token, resume;

  // Setup before each test
  beforeEach(async () => {
    // Create a test user
    const testData = await createTestUser();
    user = testData.user;
    token = testData.token;
    
    // Create a test resume
    resume = await createTestResume(user._id);
  });

  // Clean up after tests
  afterEach(async () => {
    await cleanupTestData();
  });

  describe('GET /api/resume', () => {
    it('should get all resumes for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/resume')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .get('/api/resume')
        .expect(401);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/resume/:resumeId', () => {
    it('should get a specific resume by ID', async () => {
      const response = await request(app)
        .get(`/api/resume/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('resumeId');
      expect(response.body.data).toHaveProperty('originalText');
      expect(response.body.data).toHaveProperty('versions');
      expect(response.body.data.resumeId).toBe(resume._id.toString());
    });

    it('should return 404 for non-existent resume', async () => {
      const nonExistentId = generateObjectId();
      
      const response = await request(app)
        .get(`/api/resume/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/resume/enhance/:resumeId', () => {
    it('should enhance a resume', async () => {
      const response = await request(app)
        .post(`/api/resume/enhance/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('resumeId');
      expect(response.body.data).toHaveProperty('enhancedText');
      expect(response.body.data).toHaveProperty('latexText');
    });

    it('should return 404 for enhancing non-existent resume', async () => {
      const nonExistentId = generateObjectId();
      
      const response = await request(app)
        .post(`/api/resume/enhance/${nonExistentId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('not found');
    });
  });

  describe('POST /api/resume/save/:resumeId', () => {
    it('should save an enhanced resume version', async () => {
      const enhancedData = {
        enhancedText: 'Enhanced resume text',
        latexText: '\\documentclass{article}\\begin{document}Enhanced resume text\\end{document}'
      };

      const response = await request(app)
        .post(`/api/resume/save/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(enhancedData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('resumeId');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data.resumeId).toBe(resume._id.toString());
    });

    it('should return 400 if enhanced text is missing', async () => {
      const response = await request(app)
        .post(`/api/resume/save/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('required');
    });
  });

  describe('POST /api/resume/cover-letter/:resumeId', () => {
    it('should generate a cover letter', async () => {
      const jobData = {
        jobTitle: 'Software Engineer',
        company: 'Tech Company',
        jobDescription: 'Looking for skilled developers...'
      };

      const response = await request(app)
        .post(`/api/resume/cover-letter/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(jobData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('coverLetter');
      expect(typeof response.body.data.coverLetter).toBe('string');
    });

    it('should return 400 if job data is incomplete', async () => {
      const response = await request(app)
        .post(`/api/resume/cover-letter/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ jobTitle: 'Software Engineer' }) // Missing required fields
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/resume/ats-score/:resumeId', () => {
    it('should provide ATS compatibility score', async () => {
      const data = {
        jobDescription: 'Looking for skilled developers with experience in Node.js, Express, MongoDB...'
      };

      const response = await request(app)
        .post(`/api/resume/ats-score/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(data)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toHaveProperty('score');
      expect(response.body.data).toHaveProperty('feedback');
      expect(typeof response.body.data.score).toBe('number');
      expect(Array.isArray(response.body.data.feedback)).toBe(true);
    });

    it('should return 400 if job description is missing', async () => {
      const response = await request(app)
        .post(`/api/resume/ats-score/${resume._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(response.body.status).toBe('error');
      expect(response.body.message).toContain('required');
    });
  });
}); 