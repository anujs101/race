# Resume Enhancement with Python Integration

This document describes the resume enhancement feature using Python integration in the backend.

## Overview

The backend now supports an enhanced resume processing pipeline that combines Gemini AI classification with Python-based resume enhancement. This integration allows for more advanced processing capabilities and better structured resume output.

## Architecture

The implementation follows these key components:

1. **Node.js Backend**: Handles API requests, user authentication, and communication with the Python scripts.
2. **Python Enhancement Engine**: Performs advanced processing on the classified resume data.
3. **Bridge Layer**: Facilitates communication between Node.js and Python.

## Data Flow

```
Frontend → Node.js API → Gemini Classification → Python Enhancement → Final Response to Client
```

1. Client sends resume for processing
2. Node.js extracts and classifies the text using Gemini AI
3. Classified data is sent to Python for enhancement
4. Enhanced data is returned to the client

## API Endpoints

### Enhance Resume with Python

```
POST /api/resume/enhance-python/:resumeId
```

#### Request

- **URL Parameters**
  - `resumeId`: ID of the resume to enhance

- **Headers**
  - `Authorization`: Bearer token for authentication

#### Response

```json
{
  "status": "success",
  "message": "Resume enhanced successfully with Python",
  "data": {
    "resumeId": "resume-id",
    "enhanced": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "123-456-7890",
      "address": "123 Main St, Anytown, USA",
      "linkedin": "linkedin.com/in/johndoe",
      "about": "Experienced software developer...",
      "skills": ["JavaScript", "Python", "React"],
      "experience": ["Senior Developer at ABC Corp (2018-Present)..."],
      "education": ["BS Computer Science, University of XYZ (2014-2018)"],
      "projects": ["Project Management System: A web application for..."],
      "certifications": ["AWS Certified Developer"],
      "achievements": ["Increased system performance by 30%"]
    },
    "latexText": "\\documentclass{article}..."
  }
}
```

## Implementation Details

### Python Integration

The backend uses a wrapper script to communicate with the Python enhancement module. This wrapper handles:

- Command-line argument parsing
- JSON serialization/deserialization
- Error handling
- Function routing

### Python Enhancement Functions

The Python module provides several key functions:

1. `parse_enhanced_resume`: Enhances the resume structure and content
2. `render_latex`: Generates LaTeX code for the resume
3. `match_jobs`: Finds matching jobs based on resume content
4. `generate_learning_path`: Creates personalized learning recommendations
5. `generate_cover_letter`: Produces tailored cover letters for job applications

## Setup and Dependencies

### Node.js Dependencies

The Node.js backend requires:
- winston (for logging)
- child_process (for spawning Python processes)

### Python Dependencies

Python enhancement requires:
- jinja2 (for templating)
- pdflatex (for PDF generation)
- faiss-cpu (for vector operations)
- sentence-transformers (for embeddings)
- groq (LLM API client)

### Installation

To set up the Python dependencies:

```bash
# From the backend directory
npm run check:python
```

This script will:
1. Check if Python is installed
2. Create a requirements.txt file if needed
3. Install the required dependencies

## Error Handling

The implementation includes comprehensive error handling:

1. Python script execution errors
2. JSON parsing errors
3. API communication issues
4. Middleware validation

## Future Enhancements

Planned improvements include:
- Support for additional document formats
- More customization options
- Integration with additional LLMs
- Performance optimizations

## Troubleshooting

Common issues and solutions:

1. **Python script not found**: Ensure the Python environment is properly set up
2. **Dependency issues**: Run `npm run check:python` to install required packages
3. **Classification errors**: Check that the Gemini API key is valid
4. **JSON parsing errors**: Verify the format of data being passed between systems 