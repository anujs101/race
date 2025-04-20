# Cover Letter Generation API

## Overview

The Cover Letter Generation API endpoint allows users to create professionally written cover letters based on their resume and a job description. The system leverages the Python implementation of the cover letter generator from the enhancer.ipynb notebook.

## API Endpoint

### Generate Enhanced Cover Letter

**Endpoint:** `POST /api/resume/generate-cover-letter/:resumeId`

**Authentication:** Required (JWT Bearer Token)

**URL Parameters:**
- `resumeId`: ID of the resume to use as the basis for the cover letter

**Request Body:**
```json
{
  "jobTitle": "Software Engineer",
  "companyName": "Tech Company Inc.",
  "jobDescription": "We are looking for a skilled developer with experience in JavaScript, React, and Node.js..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Cover letter generated successfully",
  "data": {
    "coverLetter": "Dear Hiring Manager at Tech Company Inc.,\n\nI am writing to express my interest in the Software Engineer position...",
    "metadata": {
      "jobTitle": "Software Engineer",
      "companyName": "Tech Company Inc.",
      "generatedAt": "2023-05-30T15:30:00Z"
    }
  }
}
```

## Error Responses

The API may return the following error responses:

- **400 Bad Request** - Missing required parameters
  ```json
  {
    "status": "error",
    "message": "Missing required fields: jobTitle, companyName"
  }
  ```

- **404 Not Found** - Resume not found or not accessible by the current user
  ```json
  {
    "status": "error",
    "message": "Resume not found or you do not have permission to access it"
  }
  ```

- **500 Internal Server Error** - Server-side errors
  ```json
  {
    "status": "error",
    "message": "Server error generating cover letter"
  }
  ```

## How It Works

1. The API receives a request with resume ID, job title, company name, and job description
2. The system validates the request and retrieves the resume content
3. The resume text, job title, company name, and job description are passed to a Python script
4. The Python script extracts the `generate_cover_letter` function from the enhancer.ipynb notebook
5. The function generates a tailored cover letter based on the resume and job details
6. The system saves the cover letter to the user's resume document and returns it in the response

## Implementation Details

- The endpoint uses a Python bridge that ensures robust communication between Node.js and Python
- The cover letter is generated using the same advanced model as in the Jupyter notebook
- The system handles errors gracefully at all levels (validation, resume retrieval, Python execution)
- The cover letter is automatically saved to the resume's cover letter history

## Postman Testing Guide

### Setup
1. Make sure your server is running locally (`npm run dev` in the project root)
2. Open Postman and create a new request

### Authentication
1. Log in first to get a token:
   - Make a POST request to `http://localhost:5001/api/users/login`
   - Set Body to raw JSON: `{"email": "your-email@example.com", "password": "your-password"}`
   - Send the request and copy the token from the response

2. For cover letter generation requests:
   - In the Headers tab, add `Authorization` with value `Bearer your-token-here`

### Generating a Cover Letter
1. Set the request method to POST
2. Enter the URL: `http://localhost:5001/api/resume/generate-cover-letter/your-resume-id`
3. In the Headers tab:
   - Add `Content-Type: application/json`
   - Add your Authorization header from step 2
4. In the Body tab, select "raw" and "JSON", then enter:
   ```json
   {
     "jobTitle": "Software Engineer",
     "companyName": "Tech Company Inc.",
     "jobDescription": "We are looking for a skilled developer with experience in JavaScript, React, and Node.js..."
   }
   ```
5. Send the request

### Common Errors and Troubleshooting

#### 1. "Server error generating cover letter"
- **Possible causes:**
  - Python environment issues
  - Missing Python dependencies
  - Issues extracting the function from the notebook
- **Solution:**
  - Check server logs for details
  - Ensure nbformat is installed: `pip install nbformat`
  - Check that enhancer.ipynb is accessible at the expected path

#### 2. "Invalid token" or "Authentication failed"
- **Possible causes:**
  - Token expired (tokens last for 7 days)
  - Incorrect token format
- **Solution:**
  - Generate a new token by logging in again
  - Ensure you're using the format `Bearer your-token-here` with no extra spaces

#### 3. "Missing required fields"
- **Possible causes:**
  - Missing job title, company name, or job description in request
  - Empty fields in request
- **Solution:**
  - Check that your JSON body includes all required fields with non-empty values

#### 4. "Resume not found"
- **Possible causes:**
  - Invalid resume ID
  - The resume belongs to another user
- **Solution:**
  - Verify the resume ID is correct
  - Ensure you're authenticated as the owner of the resume

## Development Notes

The cover letter generation feature uses:
- Python bridge for Node.js to Python communication
- nbformat for extracting functions from Jupyter notebooks
- Robust error handling and logging
- Consistent response formatting

### Improvements Over Job Matching Implementation

1. Better Python environment detection
2. More robust error handling
3. Consistent validation and error messages
4. Comprehensive logging
5. Better JSON parsing for handling potential issues 