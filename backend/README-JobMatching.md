# Job Matching API

## Overview

The Job Matching API endpoint allows users to search for jobs and get personalized matches based on their resume. The system leverages SerpAPI for job searching and machine learning (FAISS and sentence-transformers) to provide ranked job recommendations.

## API Endpoint

### Find Job Matches

**Endpoint:** `POST /api/jobs/find-matches`

**Authentication:** Required (JWT Bearer Token)

**Request Body:**
```json
{
  "resumeId": "60d0fe4f5311236168a109ca", // Optional - if provided, matches will be ranked based on resume
  "jobTitle": "Software Engineer",         // Required
  "location": "San Francisco",             // Optional - improves search results
  "limit": 5                               // Optional - number of jobs to return (default: 5)
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "matches": [
      {
        "title": "Senior Software Engineer",
        "company": "Tech Company Inc.",
        "location": "San Francisco, CA",
        "description": "We are looking for a skilled developer...",
        "applicationLink": "https://example.com/apply",
        "postedTime": "3 days ago",
        "jobType": "Full-time",
        "similarityScore": 0.89           // Only present when resumeId is provided
      },
      // Additional job matches...
    ],
    "metadata": {
      "query": {
        "jobTitle": "Software Engineer",
        "location": "San Francisco"
      },
      "total": 5,
      "generatedAt": "2023-05-30T15:30:00Z"
    }
  }
}
```

## Error Responses

The API may return the following error responses:

- **400 Bad Request** - Missing required parameters or invalid inputs
  ```json
  {
    "status": "error",
    "errors": {
      "jobTitle": "Job title is required"
    }
  }
  ```

- **404 Not Found** - Resume not found (when resumeId is provided)
  ```json
  {
    "status": "error",
    "message": "Resume not found"
  }
  ```

- **500 Internal Server Error** - Server-side errors
  ```json
  {
    "status": "error",
    "message": "Error finding matching jobs: SerpAPI request failed"
  }
  ```

## How It Works

1. The API receives a job search request with optional resume ID
2. If a resume ID is provided, the system:
   - Retrieves the resume text and formats it
   - Uses text embeddings to compare resume content with job descriptions
   - Ranks jobs based on similarity scores
3. The system returns jobs in order of relevance to the user's resume

## Dependencies

- SerpAPI for job searching
- Sentence Transformers for text embeddings
- FAISS for efficient similarity search
- Node.js and Python integration via child processes

## Environment Variables

- `SERPAPI_KEY`: API key for SerpAPI (required)
- `PYTHON_PATH`: Optional path to Python executable (defaults to 'python')

## Job Matching API Guide

### Endpoints

#### Find Job Matches
**Endpoint:** `POST /api/jobs/find-matches`
**Authentication:** Required (JWT Bearer token)

#### Request Parameters
| Parameter | Type   | Required | Description |
|-----------|--------|----------|-------------|
| jobTitle  | string | Yes      | The job title to search for |
| location  | string | No       | Location for the job search (city, state, or "Remote") |
| resumeId  | string | No       | Optional resume ID to rank jobs based on resume content |
| limit     | number | No       | Maximum number of jobs to return (default: 5) |

#### Response Format
```json
{
  "status": "success",
  "data": {
    "matches": [
      {
        "title": "Software Engineer",
        "company": "Example Corp",
        "location": "San Francisco, CA",
        "description": "Job description text...",
        "applicationLink": "https://example.com/apply",
        "postedTime": "3 days ago",
        "jobType": "Full-time",
        "similarityScore": 0.85 // Only present when resumeId is provided
      }
    ],
    "metadata": {
      "query": {
        "jobTitle": "Software Engineer",
        "location": "San Francisco"
      },
      "total": 1,
      "generatedAt": "2023-04-20T07:00:22.135263"
    }
  }
}
```

#### Error Response
```json
{
  "status": "error",
  "message": "Error message details"
}
```

## Postman Testing Guide

### Setup
1. Make sure your server is running locally (`npm run dev` in the project root)
2. Open Postman and create a new request

### Authentication
1. Log in first to get a token:
   - Make a POST request to `http://localhost:5001/api/users/login`
   - Set Body to raw JSON: `{"email": "your-email@example.com", "password": "your-password"}`
   - Send the request and copy the token from the response

2. For job matching requests:
   - In the Headers tab, add `Authorization` with value `Bearer your-token-here`

### Finding Jobs
1. Set the request method to POST
2. Enter the URL: `http://localhost:5001/api/jobs/find-matches`
3. In the Headers tab:
   - Add `Content-Type: application/json`
   - Add your Authorization header from step 2
4. In the Body tab, select "raw" and "JSON", then enter:
   ```json
   {
     "jobTitle": "Software Engineer",
     "location": "San Francisco"
   }
   ```
5. Send the request

### Testing with Resume Ranking
1. Follow the same steps as above, but include a resumeId in your request body:
   ```json
   {
     "jobTitle": "Software Engineer",
     "location": "San Francisco",
     "resumeId": "your-resume-id"
   }
   ```

### Common Errors and Troubleshooting

#### 1. "Server error finding job matches"
- **Possible causes:**
  - Python environment issues
  - Missing Python dependencies
  - API key issues
- **Solution:**
  - Ensure your virtual environment has all required Python packages installed:
    ```
    pip install sentence-transformers faiss-cpu numpy transformers requests
    ```

#### 2. "Invalid token" or "Authentication failed"
- **Possible causes:**
  - Token expired (tokens last for 7 days)
  - Incorrect token format
- **Solution:**
  - Generate a new token by logging in again
  - Ensure you're using the format `Bearer your-token-here` with no extra spaces

#### 3. "Job title is required"
- **Possible causes:**
  - Missing jobTitle field in request
  - Empty jobTitle value
- **Solution:**
  - Check that your JSON body includes a non-empty jobTitle field

#### 4. "500 Internal Server Error" in Postman
- **Possible causes:**
  - Server not running
  - Server crashed
  - Python script error
- **Solution:**
  - Check server logs for details
  - Restart the server
  - Make sure all Python dependencies are installed

## Development Notes

The job matching feature uses a Python script that requires:
- sentence-transformers
- faiss-cpu 
- numpy
- requests

To install these dependencies:
```
pip install sentence-transformers faiss-cpu numpy requests
```

The script also requires a SerpAPI key, which can be set as an environment variable:
```
export SERPAPI_KEY=your-key-here
``` 