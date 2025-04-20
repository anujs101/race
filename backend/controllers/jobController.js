/**
 * Job Controller - Handles job search and matching API endpoints
 */

const path = require('path');
const Resume = require('../models/Resume');
const { executePythonScript } = require('../utils/pythonBridge');
const { flatten_resume_json } = require('../utils/resumeFormatter');

// Path to the Python job matching script
const JOB_MATCHING_SCRIPT = path.join(__dirname, '../scripts/job_matching.py');

/**
 * Find matching jobs based on job title, location, and optionally a resume
 * @route POST /api/jobs/find-matches
 */
const findJobMatches = async (req, res) => {
  try {
    console.log('findJobMatches called with body:', JSON.stringify(req.body));
    const { resumeId, jobTitle, location, limit = 5 } = req.body;

    // Validate required parameters
    if (!jobTitle) {
      return res.status(400).json({
        status: 'error',
        message: 'Job title is required'
      });
    }

    let resumeText = null;

    // If resumeId is provided, fetch and format the resume text
    if (resumeId) {
      try {
        console.log(`Getting resume data for ID: ${resumeId}`);
        // Find resume and validate ownership
        const resume = await Resume.findOne({
          _id: resumeId,
          userId: req.user._id
        }).lean();

        if (!resume) {
          return res.status(404).json({
            status: 'error',
            message: 'Resume not found or you do not have permission to access it'
          });
        }

        // Get latest version with classification data
        let classification = null;
        if (resume.versions && resume.versions.length > 0) {
          const latestVersion = resume.versions[resume.versions.length - 1];
          if (latestVersion.classification) {
            classification = latestVersion.classification;
          }
        }

        // If no classification found, use default empty structure
        if (!classification) {
          console.log('No classification data found for resume, using empty structure');
          classification = {
            contactInfo: {},
            education: [],
            experience: [],
            projects: [],
            skills: [],
            certifications: [],
            achievements: []
          };
        }

        // Format resume for job matching
        const resumeData = {
          data: {
            resumeId: resume._id.toString(),
            classification: classification,
            isScannedDocument: false
          }
        };

        try {
          resumeText = flatten_resume_json(resumeData);
          console.log('Successfully formatted resume text');
        } catch (formatError) {
          console.error('Error formatting resume JSON:', formatError);
          return res.status(500).json({
            status: 'error',
            message: 'Error formatting resume data',
            error: process.env.NODE_ENV === 'development' ? formatError.message : undefined
          });
        }
      } catch (error) {
        console.error('Error processing resume:', error);
        return res.status(500).json({
          status: 'error',
          message: 'Error processing resume data',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }

    // Prepare parameters for Python script
    const scriptParams = {
      resumeText,
      jobTitle,
      location: location || '',
      limit: parseInt(limit, 10)
    };

    console.log(`Executing job matching script with params: ${JSON.stringify({
      jobTitle: scriptParams.jobTitle,
      location: scriptParams.location,
      limit: scriptParams.limit,
      hasResumeText: !!scriptParams.resumeText
    })}`);

    // Execute Python script to find matching jobs
    try {
      const result = await executePythonScript(JOB_MATCHING_SCRIPT, scriptParams);

      // Return response based on the Python script's result
      if (result.status === 'error') {
        console.error('Error from Python script:', result.message);
        return res.status(500).json({
          status: 'error',
          message: result.message || 'Error finding matching jobs'
        });
      }

      return res.status(200).json(result);
    } catch (scriptError) {
      console.error('Error in findJobMatches when executing Python script:', scriptError);
      return res.status(500).json({
        status: 'error',
        message: 'Server error finding job matches',
        error: process.env.NODE_ENV === 'development' ? scriptError.message : undefined
      });
    }
  } catch (error) {
    console.error('Error in findJobMatches:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error finding job matches',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  findJobMatches
}; 