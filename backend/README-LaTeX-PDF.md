# LaTeX to PDF Conversion in Chat API

## Overview

This feature enhances the chat functionality by automatically converting LaTeX resume content to PDF when an AI response contains LaTeX. The implementation follows these steps:

1. Detect when the AI response contains LaTeX content
2. Extract the LaTeX code from the response
3. Convert the LaTeX code to PDF using pdflatex
4. Return the PDF as a base64-encoded string in the API response

## Implementation Details

### 1. LaTeX Detection and Extraction

The system uses regex patterns to identify LaTeX content in AI responses:
- Checks for LaTeX markers like `\documentclass`, `\begin{document}`, and `\end{document}`
- Can extract LaTeX from code blocks (```latex ... ```) or plain text

### 2. PDF Conversion Process

When LaTeX content is detected:
1. A unique temporary directory is created to handle parallel requests
2. The LaTeX content is saved to a temporary .tex file
3. pdflatex is executed to convert the .tex file to PDF
4. The PDF is read and converted to base64
5. All temporary files are cleaned up

### 3. API Response Format

The API returns an enhanced response when LaTeX is detected:

```json
{
  "success": true,
  "chat": [...messages],
  "message": "AI response text",
  "hasLaTeX": true,
  "pdf": "base64-encoded-pdf-content",
  "filename": "resume_<resumeId>_v<version>.pdf"
}
```

If PDF conversion fails (e.g., pdflatex not installed), the API still returns:

```json
{
  "success": true,
  "chat": [...messages],
  "message": "AI response text",
  "hasLaTeX": true,
  "latexContent": "extracted-latex-content",
  "pdfError": "Error message explaining why PDF conversion failed"
}
```

## Requirements

To use the PDF conversion feature, the server must have:
1. `pdflatex` installed and available in the system PATH
2. Node.js with the `node-latex` package

## Prompting the AI for LaTeX

The AI is trained to recognize certain keywords that trigger LaTeX generation:
- "latex", "resume", "format", "template", "generate", "create new", etc.
- When these are detected, the AI will generate a LaTeX version of the resume

## Security and Performance

- Each conversion uses a unique temporary directory to avoid conflicts
- All temporary files are cleaned up after processing
- LaTeX compilation is isolated to prevent security issues
- Error handling ensures the API remains functional even if PDF conversion fails

## Frontend Implementation Guide

### 1. Sending Chat Messages

Send chat messages to the API using a POST request:

```javascript
async function sendChatMessage(resumeId, message) {
  try {
    const response = await fetch(`/api/chat/${resumeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    
    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}
```

### 2. Handling API Responses

When a response contains PDF data, process it accordingly:

```javascript
async function handleChatResponse(response) {
  // Update chat UI with messages
  updateChatMessages(response.chat);
  
  // Check if response includes a PDF
  if (response.hasLaTeX) {
    if (response.pdf) {
      // Handle successful PDF conversion
      displayPdfDownloadOption(response.pdf, response.filename);
    } else if (response.latexContent) {
      // Handle case where PDF conversion failed but LaTeX is available
      displayLatexContent(response.latexContent, response.pdfError);
    }
  }
}
```

### 3. Displaying the PDF

Create PDF viewer or download option:

```javascript
function displayPdfDownloadOption(base64Pdf, filename) {
  // Create a download link
  const downloadLink = document.createElement('a');
  downloadLink.href = `data:application/pdf;base64,${base64Pdf}`;
  downloadLink.download = filename;
  downloadLink.innerHTML = `<button>Download ${filename}</button>`;
  
  // Add to chat UI
  const pdfContainer = document.getElementById('pdf-container');
  pdfContainer.innerHTML = '';
  pdfContainer.appendChild(downloadLink);
  
  // Optional: Display inline PDF viewer
  const pdfViewer = document.createElement('embed');
  pdfViewer.src = `data:application/pdf;base64,${base64Pdf}`;
  pdfViewer.type = 'application/pdf';
  pdfViewer.width = '100%';
  pdfViewer.height = '500px';
  pdfContainer.appendChild(pdfViewer);
}
```

### 4. Handling Failed PDF Conversion

Display LaTeX content when PDF conversion fails:

```javascript
function displayLatexContent(latexContent, errorMessage) {
  const latexContainer = document.getElementById('latex-container');
  
  // Show error message
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = `PDF generation failed: ${errorMessage}`;
  
  // Show LaTeX content
  const preElement = document.createElement('pre');
  preElement.textContent = latexContent;
  
  // Clear container and add new elements
  latexContainer.innerHTML = '';
  latexContainer.appendChild(errorElement);
  latexContainer.appendChild(preElement);
}
```

### 5. Prompting the User

Add UI elements to help users request LaTeX resumes:

```javascript
function setupLatexPrompts() {
  const promptTemplates = [
    "Can you create a LaTeX version of my resume?",
    "Please format my resume in LaTeX",
    "Generate a PDF version of my resume",
    "I need a professionally formatted resume in LaTeX"
  ];
  
  const promptContainer = document.getElementById('latex-prompts');
  promptTemplates.forEach(prompt => {
    const button = document.createElement('button');
    button.textContent = prompt;
    button.onclick = () => {
      document.getElementById('chat-input').value = prompt;
    };
    promptContainer.appendChild(button);
  });
}
```

### 6. Complete Example

Here's a complete React component example:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import './ChatWithResume.css';

function ChatWithResume({ resumeId, token }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [pdfData, setPdfData] = useState(null);
  const [latexData, setLatexData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    // Load chat history when component mounts
    fetchChatHistory();
    
    // Setup scroll behavior
    scrollToBottom();
  }, [messages]);
  
  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/chat/${resumeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.status === 'success' && data.data.messages) {
        setMessages(data.data.messages);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };
  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    
    try {
      setIsLoading(true);
      // Add user message to UI immediately for better UX
      setMessages([...messages, { role: 'user', msg: inputMessage, timestamp: new Date() }]);
      setInputMessage('');
      
      // Send to API
      const response = await fetch(`/api/chat/${resumeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: inputMessage })
      });
      
      const data = await response.json();
      
      // Update messages from API response
      if (data.success && data.chat) {
        setMessages(data.chat);
        
        // Handle PDF if present
        if (data.hasLaTeX) {
          if (data.pdf) {
            setPdfData({
              base64: data.pdf,
              filename: data.filename
            });
            setLatexData(null);
          } else if (data.latexContent) {
            setLatexData({
              content: data.latexContent,
              error: data.pdfError
            });
            setPdfData(null);
          }
        } else {
          setPdfData(null);
          setLatexData(null);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadPdf = () => {
    if (!pdfData) return;
    
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${pdfData.base64}`;
    link.download = pdfData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-content">{msg.msg}</div>
            <div className="message-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {pdfData && (
        <div className="pdf-container">
          <h3>Resume PDF Generated</h3>
          <button onClick={handleDownloadPdf}>
            Download {pdfData.filename}
          </button>
          <embed 
            src={`data:application/pdf;base64,${pdfData.base64}`}
            type="application/pdf"
            width="100%"
            height="500px"
          />
        </div>
      )}
      
      {latexData && (
        <div className="latex-container">
          <h3>LaTeX Content (PDF generation failed)</h3>
          <div className="error-message">{latexData.error}</div>
          <pre>{latexData.content}</pre>
        </div>
      )}
      
      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      
      <div className="prompt-suggestions">
        <h4>Try asking:</h4>
        <button onClick={() => setInputMessage("Create a LaTeX version of my resume")}>
          Create a LaTeX version of my resume
        </button>
        <button onClick={() => setInputMessage("Format my resume professionally")}>
          Format my resume professionally
        </button>
      </div>
    </div>
  );
}

export default ChatWithResume;
```

### 7. CSS Styling

Add appropriate styling for the chat UI:

```css
.chat-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ccc;
  padding: 10px;
  margin-bottom: 20px;
  background-color: #f9f9f9;
}

.message {
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 5px;
  max-width: 80%;
}

.message.user {
  background-color: #dcf8c6;
  align-self: flex-end;
  margin-left: auto;
}

.message.bot {
  background-color: #f1f0f0;
}

.pdf-container, .latex-container {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.error-message {
  color: #d9534f;
  margin-bottom: 10px;
}

.message-form {
  display: flex;
  margin-bottom: 20px;
}

.message-form input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
}

.message-form button {
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

.prompt-suggestions {
  margin-top: 20px;
}

.prompt-suggestions button {
  margin: 5px;
  padding: 8px 12px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
```

## Future Improvements

- Add caching for generated PDFs to improve performance
- Support for custom LaTeX templates
- Expand LaTeX detection patterns for better accuracy 