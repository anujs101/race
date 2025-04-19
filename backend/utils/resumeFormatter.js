/**
 * Utility for formatting resume data
 */

/**
 * Flattens a resume JSON object into a human-readable text format
 * @param {Object} resume_json - Resume JSON object with classification data
 * @returns {string} Formatted resume text
 */
const flatten_resume_json = (resume_json) => {
  try {
    if (!resume_json || !resume_json.data || !resume_json.data.classification) {
      console.warn('Invalid resume data structure provided to flatten_resume_json');
      return 'Resume data is not available in the expected format.';
    }

    const classification = resume_json.data.classification;
    const parts = [];

    // Contact Info
    const contact = classification.contactInfo || {};
    parts.push(`Name: ${contact.name || ''}`);
    parts.push(`Email: ${contact.email || ''}`);
    parts.push(`Phone: ${contact.phone || ''}`);
    parts.push(`Address: ${contact.address || ''}`);
    parts.push(`LinkedIn: ${contact.linkedin || ''}`);

    // Education
    const education = classification.education || [];
    if (education.length > 0) {
      parts.push("\nEducation:");
      for (const edu of education) {
        parts.push(`- ${edu}`);
      }
    }

    // Experience
    const experience = classification.experience || [];
    if (experience.length > 0) {
      parts.push("\nExperience:");
      for (const exp of experience) {
        if (typeof exp === 'object' && exp !== null) {
          const role = exp.role || 'Role not specified';
          const org = exp.organization || 'Organization not specified';
          const duration = exp.duration || 'Duration not specified';
          const desc = exp.description || '';
          
          parts.push(`- ${role} at ${org} (${duration}): ${desc}`);
        } else if (typeof exp === 'string') {
          // Handle case where experience might be just a string
          parts.push(`- ${exp}`);
        }
      }
    }

    // Projects
    const projects = classification.projects || [];
    if (projects.length > 0) {
      parts.push("\nProjects:");
      for (const proj of projects) {
        if (typeof proj === 'object' && proj !== null) {
          const name = proj.name || 'Project name not specified';
          const desc = proj.description || '';
          
          parts.push(`- ${name}: ${desc}`);
        } else if (typeof proj === 'string') {
          // Handle case where project might be just a string
          parts.push(`- ${proj}`);
        }
      }
    }

    // Skills
    const skills = classification.skills || [];
    if (skills.length > 0) {
      parts.push("\nSkills: " + skills.join(", "));
    }

    // Certifications
    const certs = classification.certifications || [];
    if (certs.length > 0) {
      parts.push("\nCertifications:");
      for (const cert of certs) {
        parts.push(`- ${cert}`);
      }
    }

    // Achievements
    const achievements = classification.achievements || [];
    if (achievements.length > 0) {
      parts.push("\nAchievements:");
      for (const ach of achievements) {
        parts.push(`- ${ach}`);
      }
    }

    return parts.join("\n");
  } catch (error) {
    console.error('Error in flatten_resume_json:', error);
    return 'An error occurred while formatting the resume data.';
  }
};

module.exports = {
  flatten_resume_json
}; 