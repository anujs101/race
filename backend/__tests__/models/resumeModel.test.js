const mongoose = require('mongoose');
const Resume = require('../../models/Resume');
const User = require('../../models/User');

describe('Resume Model', () => {
  let validResumeData;
  let mockUserId;

  beforeEach(() => {
    // Create a mock ObjectId for a user
    mockUserId = new mongoose.Types.ObjectId();
    
    // Setup valid resume data
    validResumeData = {
      userId: mockUserId,
      originalText: 'This is a resume example text',
      versions: [{
        version: '1.0',
        text: 'Enhanced resume text',
        latexText: '\\documentclass{article}\\begin{document}Enhanced resume text\\end{document}'
      }]
    };
  });

  it('should be defined', () => {
    expect(Resume).toBeDefined();
  });

  describe('Resume Schema', () => {
    it('should have the correct fields', () => {
      // Get schema paths
      const schemaPaths = Resume.schema.paths;
      
      // Check required fields exist
      expect(schemaPaths.userId).toBeDefined();
      expect(schemaPaths.originalText).toBeDefined();
      expect(schemaPaths.versions).toBeDefined();
      expect(schemaPaths.createdAt).toBeDefined();
    });

    it('should require userId', () => {
      const testResume = new Resume({ ...validResumeData, userId: undefined });
      const validationError = testResume.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.userId).toBeDefined();
      expect(validationError.errors.userId.kind).toEqual('required');
    });

    it('should require originalText', () => {
      const testResume = new Resume({ ...validResumeData, originalText: undefined });
      const validationError = testResume.validateSync();
      
      expect(validationError).toBeDefined();
      expect(validationError.errors.originalText).toBeDefined();
      expect(validationError.errors.originalText.kind).toEqual('required');
    });

    it('should properly reference User model in userId field', () => {
      // Check reference configuration
      const userIdField = Resume.schema.paths.userId;
      
      expect(userIdField.instance).toEqual('ObjectId');
      expect(userIdField.options.ref).toEqual('User');
    });

    it('should include default createdAt date', () => {
      const testResume = new Resume(validResumeData);
      
      expect(testResume.createdAt).toBeDefined();
      expect(testResume.createdAt instanceof Date).toBeTruthy();
    });

    describe('versions subdocument', () => {
      it('should validate version and text fields in versions array', () => {
        const invalidVersionsData = {
          ...validResumeData,
          versions: [{
            // Missing required version field
            text: 'Enhanced resume text'
          }]
        };
        
        const testResume = new Resume(invalidVersionsData);
        const validationError = testResume.validateSync();
        
        expect(validationError).toBeDefined();
        expect(validationError.errors['versions.0.version']).toBeDefined();
      });

      it('should include createdAt timestamp for each version', () => {
        const testResume = new Resume(validResumeData);
        
        expect(testResume.versions[0].createdAt).toBeDefined();
        expect(testResume.versions[0].createdAt instanceof Date).toBeTruthy();
      });
      
      it('should allow latexText to be optional', () => {
        const versionWithoutLatex = {
          ...validResumeData,
          versions: [{
            version: '1.0',
            text: 'Enhanced resume text',
            // latexText is intentionally omitted
          }]
        };
        
        const testResume = new Resume(versionWithoutLatex);
        const validationError = testResume.validateSync();
        
        expect(validationError).toBeUndefined();
      });
    });
  });
});
