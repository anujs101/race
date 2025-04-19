import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, FileUp, Bot, User } from 'lucide-react';
import FileUploadModal from '../Components/FileUploadModal ';

const ChatPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [documentData, setDocumentData] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you with your resume today?' },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const storedDocument = localStorage.getItem('chatDocument');
    if (storedDocument) {
      setDocumentData(JSON.parse(storedDocument));
      const storedChats = localStorage.getItem('chatHistory');
      if (storedChats) {
        const parsedChats = JSON.parse(storedChats);
        const formattedMessages = parsedChats.map(chat => ({
          sender: chat.isUser ? 'user' : 'bot',
          text: chat.message
        }));
        if (formattedMessages.length > 0) {
          setMessages(formattedMessages);
        }
      }
    } else {
      setShowModal(true);
    }
  }, []);

  const handleCloseModal = () => {
    const storedDocument = localStorage.getItem('chatDocument');
    if (storedDocument) {
      setDocumentData(JSON.parse(storedDocument));
      setShowModal(false);
    } else {
      setShowModal(true);
    }
  };

  const handleResetDocument = () => {
    localStorage.removeItem('chatDocument');
    setDocumentData(null);
    setShowModal(true);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [
      ...messages,
      { sender: 'user', text: input },
      { sender: 'bot', text: "Thanks! I'll process your input shortly." },
    ];
    
    setMessages(newMessages);
    setInput('');
    
    if (documentData) {
      const chatHistory = newMessages.map(msg => ({
        isUser: msg.sender === 'user',
        message: msg.text
      }));
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="h-[85vh] w-full rounded-xl border bg-background shadow-lg">
      {/* Document info and chat header */}
      <div className="p-4 border-b bg-muted/30">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold">AI Resume Assistant</h2>
            {documentData && (
              <p className="text-sm text-muted-foreground">
                Working on: {documentData.name} ({new Date(documentData.uploadedAt).toLocaleDateString()})
              </p>
            )}
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleResetDocument}
            className="gap-2"
          >
            <FileUp className="h-4 w-4" />
            Upload New
          </Button>
        </div>
      </div>

      <CardContent className="p-0 flex flex-col h-[calc(100%-8rem)]">
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
          style={{
            backgroundImage: 'radial-gradient(circle at center, rgba(var(--background)/0.1) 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm shadow-sm
                  ${msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-accent/50 text-accent-foreground rounded-bl-none'
                  }
                `}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-2 bg-background rounded-lg p-2 shadow-sm">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setShowModal(true)}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <Input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button 
              onClick={handleSend}
              className="rounded-full px-3 h-8"
            >
              <Send className="h-4 w-4 mr-1" />
              Send
            </Button>
          </div>
        </div>
      </CardContent>

      <FileUploadModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
      />
    </Card>
  );
};

export default ChatPage;