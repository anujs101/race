# RACE Backend - Resume Acceleration and Career Enhancement

The backend for the RACE platform that handles resume processing, enhancement, and career tools using Gemini AI.

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/race
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   ```

3. **Run the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   
   # Debug mode
   npm run debug
   ```

## Testing

The project includes a comprehensive test suite that tests all API endpoints, middleware, and utility functions.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Structure

The test suite is organized into the following directories:

- `__tests__/routes`: Tests for API endpoints
- `__tests__/middleware`: Tests for middleware functions
- `__tests__/utils`: Tests for utility functions
- `__tests__/models`: Tests for database models

Tests use Jest as the test runner and the following libraries:
- `supertest`: For testing HTTP endpoints
- `mongodb-memory-server`: For in-memory MongoDB database
- `node-mocks-http`: For mocking HTTP requests/responses

## API Endpoints

### Authentication

- **POST /api/users/register** - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **POST /api/users/login** - Login and get JWT token
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

- **GET /api/users/me** - Get current user profile (requires auth)

### Resume Management

- **POST /api/resume/upload** - Upload a resume PDF (requires auth)
  ```
  Form data: { resume: [PDF file] }
  ```

- **POST /api/resume/enhance/:resumeId** - Enhance resume with Gemini AI (requires auth)

- **POST /api/resume/save/:resumeId** - Save enhanced resume version (requires auth)
  ```json
  {
    "enhancedText": "Enhanced resume content...",
    "latexText": "LaTeX formatted resume..."
  }
  ```

- **GET /api/resume/:resumeId** - Get resume versions (requires auth)

- **GET /api/resume** - Get all user resumes (requires auth)

### Cover Letter & ATS Scoring

- **POST /api/resume/cover-letter/:resumeId** - Generate a cover letter (requires auth)
  ```json
  {
    "jobTitle": "Software Engineer",
    "company": "Tech Company",
    "jobDescription": "Job description here..."
  }
  ```

- **POST /api/resume/ats-score/:resumeId** - Score resume for ATS compatibility (requires auth)
  ```json
  {
    "jobDescription": "Job description here..."
  }
  ```

### Chatbot

- **POST /api/chat/:resumeId** - Send message to resume chatbot (requires auth)
  ```json
  {
    "message": "How can I improve my resume?"
  }
  ```

- **GET /api/chat/:resumeId** - Get chat history (requires auth)

- **DELETE /api/chat/:resumeId** - Clear chat history (requires auth)

## Security Features

- **JWT Authentication** - Secure route protection
- **Request Validation** - Input validation middleware
- **Rate Limiting** - Prevent abuse (100 requests per 15 minutes)
- **Helmet Security Headers** - Protection against common web vulnerabilities
- **Error Handling** - Centralized error management
- **CORS Configuration** - Controlled cross-origin resource sharing

## Technologies Used

- Node.js & Express - Backend framework
- MongoDB & Mongoose - Database
- JWT - Authentication
- Multer - File uploads
- Google Generative AI (Gemini) - AI processing
- PDF-Parse - PDF text extraction
- Helmet - Security headers
- Express Rate Limit - API protection
- Jest & Supertest - Testing

## Error Handling

All endpoints return standardized error responses with appropriate HTTP status codes:

```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error message (development mode only)"
}
```

## Success Responses

All successful responses follow this format:

```json
{
  "status": "success",
  "message": "Operation successful message",
  "data": { 
    /* Response data */ 
  }
}
``` 