import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! How can I assist you with your resume today?' },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;
    const newMessages = [
      ...messages,
      { sender: 'user', text: input },
      { sender: 'bot', text: 'Thanks! I’ll process your input shortly.' },
    ];
    setMessages(newMessages);
    setInput('');
  };

  // Auto scroll to bottom on new message
  useEffect(() => {
    const scroll = scrollRef.current;
    if (scroll) {
      scroll.scrollTop = scroll.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-[100%] bg-transparent  w-full rounded-xl border py-3 ">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Scrollable chat area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
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
        </div>

        {/* Input bar fixed at bottom */}
        <div className="flex items-center p-1 border-t ">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 mt-2 mr-2"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend} className="mt-2 mr-2">Send</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPage;
