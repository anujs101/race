import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FileUploadModal from '../Components/FileUploadModal ';

const ChatPage = () => {
  // State for document upload modal
  const [showModal, setShowModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  
  // Original chat state
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you with your resume today?' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  // Check for document in localStorage when component mounts
  useEffect(() => {
    const storedDocument = localStorage.getItem('chatDocument');
    
    if (storedDocument) {
      setDocumentData(JSON.parse(storedDocument));
      
      // Load any existing chat history if available
      const storedChats = localStorage.getItem('chatHistory');
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        // Convert the stored chat format to match our message format
        const formattedMessages = parsedChats.map(chat => ({
          sender: chat.isUser ? 'user' : 'bot',
          text: chat.message
        }));
        
        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        }
      }
    } else {
      // If no document found, show the upload modal
      setShowModal(true);
    }
  }, []);
  
  // Handle modal close
  const handleCloseModal = () => {
    // Check if document exists after modal is closed
    const storedDocument = localStorage.getItem('chatDocument');
    
    if (storedDocument) {
      setDocumentData(JSON.parse(storedDocument));
      setShowModal(false);
    } else {
      // If still no document, keep modal open
      setShowModal(true);
    }
  };
  
  // Handle document reset
  const handleResetDocument = () => {
    localStorage.removeItem('chatDocument');
    setDocumentData(null);
    setShowModal(true);
  };
  
  // Original send message function with localStorage storage
  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [
      ...messages,
      { sender: 'user', text: input },
      { sender: 'bot', text: "Thanks! I'll process your input shortly." },
    ];
    
    setMessages(newMessages);
    setInput('');
    
    // Store messages in localStorage if we have a document
    if (documentData) {
      const chatHistory = newMessages.map(msg => ({
        isUser: msg.sender === 'user',
        message: msg.text
      }));
      
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  };
  
  // Improved scroll to bottom effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  return (
    <Card className="h-full flex flex-col bg-transparent w-full rounded-xl border">
      {/* Document info bar */}
      {documentData && (
        <div className="px-4 py-2 flex justify-between items-center border-b">
          <div className="flex items-center">
            <span className="font-medium text-sm">{documentData.name}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {new Date(documentData.uploadedAt).toLocaleDateString()}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleResetDocument}
            className="text-xs hover:bg-secondary"
          >
            Upload New Document
          </Button>
        </div>
      )}
      
      {/* Main content area with improved layout */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Chat messages area with fixed scrolling */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-background">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-accent text-accent-foreground rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} /> {/* Invisible element for scrolling */}
          </div>
        </div>
        
        {/* Input area with improved styling */}
        <div className="border-t p-3 bg-card">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Type your message..."
              className="flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>
      </div>
      
      {/* File Upload Modal */}
      <FileUploadModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />
    </Card>
  );
};

export default ChatPage;