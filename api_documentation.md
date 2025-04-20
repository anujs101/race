# RACE Resume App API Documentation

## API Endpoints

### Authentication Endpoints

#### POST /api/users/register
Register a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Flow:**
1. Validate user input (name, email, password)
2. Check if email already exists in the database
3. Hash the password
4. Create new user record
5. Generate JWT token
6. Return token and user data

#### POST /api/users/login
Authenticate a user and generate a token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Flow:**
1. Validate email and password input
2. Find user by email
3. Compare password hash
4. Generate JWT token
5. Return token and user data

#### GET /api/users/profile
Get current user's profile information.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

**Flow:**
1. Verify JWT token
2. Extract user ID from token
3. Retrieve user data from database
4. Return user profile information

### Resume Endpoints

#### POST /api/resume/upload
Upload a resume file for text extraction and classification.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Form Data:**
```
resume: [PDF File]
```

**Response:**
```json
{
  "status": "success",
  "message": "Resume uploaded and processed successfully",
  "data": {
    "resumeId": "60d0fe4f5311236168a109ca",
    "extractedText": "...",
    "classification": {
      "contactInfo": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "123-456-7890",
        "address": "New York, NY",
        "linkedin": "linkedin.com/in/johndoe"
      },
      "education": [...],
      "experience": [...],
      "skills": [...],
      "projects": [...],
      "certifications": [...],
      "achievements": [...]
    },
    "isScannedDocument": false
  }
}
```

**Flow:**
1. Authenticate user
2. Validate file (must be PDF)
3. Save file to temporary storage
4. Extract text from PDF
5. Classify resume sections with machine learning model
6. Save resume to database
7. Return extracted data

#### POST /api/resume/extract
Extract text and classification from a resume.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: multipart/form-data
```

**Form Data:**
```
resume: [PDF File]
```

**Response:**
```json
{
  "status": "success",
  "message": "Resume extracted and classified successfully",
  "data": {
    "resumeId": "60d0fe4f5311236168a109ca",
    "classification": {
      "contactInfo": {...},
      "education": [...],
      "experience": [...],
      "skills": [...],
      "projects": [...],
      "certifications": [...],
      "achievements": [...]
    },
    "isScannedDocument": false
  }
}
```

**Flow:**
1. Authenticate user
2. Validate and process PDF file
3. Extract text content
4. Classify resume sections
5. Save resume record to database
6. Return classification data

#### POST /api/resume/enhance/:resumeId
Enhance a resume using AI.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "enhancementType": "professional"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Resume enhanced successfully",
  "data": {
    "enhancedText": "...",
    "originalResumeId": "60d0fe4f5311236168a109ca"
  }
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Retrieve resume data
4. Process through AI enhancement
5. Return enhanced text

#### POST /api/resume/save-enhanced/:resumeId
Save an enhanced version of a resume.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "enhancedText": "...",
  "enhancementType": "professional"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Enhanced resume saved successfully",
  "data": {
    "resumeId": "60d0fe4f5311236168a109ca",
    "versionId": "60d0fe4f5311236168a109cb"
  }
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Create new version record
4. Save enhanced text
5. Return IDs for future reference

#### POST /api/resume/generate-cover-letter/:resumeId
Generate a cover letter based on a resume and job description.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "jobTitle": "Software Engineer",
  "companyName": "Tech Company",
  "jobDescription": "We are looking for a software engineer..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Cover letter generated successfully",
  "data": {
    "coverLetter": "...",
    "resumeId": "60d0fe4f5311236168a109ca"
  }
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Retrieve resume data
4. Generate cover letter using AI
5. Return generated cover letter

#### POST /api/resume/ats-score/:resumeId
Score a resume against a job description using ATS criteria.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "jobDescription": "We are looking for a software engineer..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Resume scored successfully",
  "data": {
    "score": 85,
    "feedback": [
      {
        "type": "strength",
        "message": "Strong technical skills matching job requirements"
      },
      {
        "type": "weakness",
        "message": "Lacks specific experience with cloud technologies"
      }
    ],
    "resumeId": "60d0fe4f5311236168a109ca"
  }
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Retrieve resume data
4. Process ATS scoring algorithm
5. Return score and detailed feedback

#### GET /api/resume/versions/:resumeId
Get all versions of a specific resume.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "versions": [
      {
        "_id": "60d0fe4f5311236168a109cb",
        "enhancementType": "professional",
        "enhancedText": "...",
        "createdAt": "2023-05-18T14:10:30Z"
      },
      {
        "_id": "60d0fe4f5311236168a109cc",
        "enhancementType": "ats-optimized",
        "enhancedText": "...",
        "createdAt": "2023-05-19T10:15:45Z"
      }
    ]
  }
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Retrieve all versions
4. Return version history

#### GET /api/resume/all
Get all resumes for the current user.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "resumes": [
      {
        "_id": "60d0fe4f5311236168a109ca",
        "filename": "john_resume.pdf",
        "createdAt": "2023-05-15T09:30:20Z",
        "latestVersion": {
          "enhancementType": "professional",
          "createdAt": "2023-05-19T10:15:45Z"
        }
      },
      {
        "_id": "60d0fe4f5311236168a109cd",
        "filename": "john_technical_resume.pdf",
        "createdAt": "2023-05-22T11:45:30Z",
        "latestVersion": null
      }
    ]
  }
}
```

**Flow:**
1. Authenticate user
2. Query database for user's resumes
3. Return resume list with latest version info

### Chat Endpoints

#### POST /api/chat/:resumeId
Send a message to the chatbot about a specific resume.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "message": "Can you generate a LaTeX version of my resume?"
}
```

**Response:**
```json
{
  "success": true,
  "chat": [
    {
      "role": "user",
      "msg": "Can you generate a LaTeX version of my resume?",
      "timestamp": "2023-05-25T15:30:45Z"
    },
    {
      "role": "bot",
      "msg": "\\documentclass{article}\n\\usepackage[margin=1in]{geometry}\n...",
      "timestamp": "2023-05-25T15:30:47Z"
    }
  ],
  "message": "\\documentclass{article}\n\\usepackage[margin=1in]{geometry}\n...",
  "pdf": "base64encodedpdf...",
  "filename": "resume_60d0fe4f5311236168a109ca_v1.pdf",
  "hasLaTeX": true
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Process user message
4. Generate response based on resume data
5. If LaTeX requested, generate LaTeX and convert to PDF
6. Save conversation to chat history
7. Return response with chat history and PDF if applicable

#### GET /api/chat/:resumeId
Get chat history for a specific resume.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "messages": [
      {
        "role": "user",
        "msg": "Can you help improve my resume?",
        "timestamp": "2023-05-25T14:20:30Z"
      },
      {
        "role": "bot",
        "msg": "I'd be happy to help! Here are some suggestions...",
        "timestamp": "2023-05-25T14:20:32Z"
      }
    ]
  }
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Retrieve chat history
4. Return message history

#### DELETE /api/chat/:resumeId
Clear chat history for a specific resume.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "status": "success",
  "message": "Chat history cleared successfully"
}
```

**Flow:**
1. Authenticate user
2. Validate resume ownership
3. Delete chat history
4. Return success message

### Root Endpoint

#### GET /api
Check if the API is running.

**Response:**
```json
{
  "status": "success",
  "message": "RACE Resume API is running"
}
```

**Flow:**
1. Return confirmation message without authentication

## Authentication
All authenticated endpoints require a valid JWT token provided in the Authorization header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The token can be obtained by registering or logging in using the authentication endpoints. 