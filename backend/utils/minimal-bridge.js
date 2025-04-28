const path = require('path');
const fs = require('fs').promises;

// Define template directories with fallbacks
const TEMPLATE_DIRS = [
  process.env.TEMPLATE_DIR || path.resolve(process.cwd(), '../templates'),
  path.resolve(process.cwd(), '../py_models'),
  process.cwd()
];

/**
 * Resolve template file path
 * @param {string} templateName - Name of the template file
 * @returns {Promise<string>} - Full path to the template file
 */
const resolveTemplatePath = async (templateName) => {
  // Check each directory for the template
  for (const dir of TEMPLATE_DIRS) {
    const templatePath = path.join(dir, templateName);
    try {
      await fs.access(templatePath);
      console.log(`Found template ${templateName} at ${templatePath}`);
      return templatePath;
    } catch (error) {
      // Template not found in this directory, continue to next
    }
  }
  
  // If template not found in any directory, throw error
  throw new Error(`Template ${templateName} not found in any of the configured directories`);
};

/**
 * Verify required templates exist
 * @returns {Promise<boolean>} - True if all templates exist
 */
const verifyTemplates = async () => {
  const requiredTemplates = ['resume_template.tex'];
  const missingTemplates = [];
  
  for (const template of requiredTemplates) {
    try {
      await resolveTemplatePath(template);
    } catch (error) {
      missingTemplates.push(template);
    }
  }
  
  if (missingTemplates.length > 0) {
    console.warn(`Missing required templates: ${missingTemplates.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Get performance metrics
 * @returns {Object} - Current performance metrics
 */
const getPerformanceMetrics = () => {
  return {
    functionCalls: 0,
    totalDuration: 0,
    maxDuration: 0,
    avgDuration: 0,
    errors: 0
  };
};

/**
 * Enhance resume data using Python script
 * @param {Object} resumeData - The resume data to enhance
 * @returns {Promise<Object>} - The enhanced resume data
 */
const enhanceResume = async (resumeData) => {
  console.log('Python bridge: enhancing resume...');
  
  try {
    // For testing purposes, we're just returning the same data
    // In a real implementation, this would call a Python script
    return {
      ...resumeData,
      enhanced: true,
      enhancedDate: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error enhancing resume:', error);
    throw new Error(`Failed to enhance resume: ${error.message}`);
  }
};

module.exports = {
  resolveTemplatePath,
  verifyTemplates,
  getPerformanceMetrics,
  enhanceResume
}; 