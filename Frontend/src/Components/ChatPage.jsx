import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Paperclip, FileUp, Bot, User, Sparkles } from 'lucide-react';
import FileUploadModal from '../Components/FileUploadModal ';
import { motion } from 'framer-motion';
import { PulseLoader } from 'react-spinners';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Add these animations
const messageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const loadingMessages = [
  "Crafting the perfect response...",
  "Analyzing your resume details...",
  "Cooking up something special...",
  "Getting what you actually deserve...",
  "Polishing your career narrative...",
  "Enhancing your professional story...",
  "Tailoring content just for you..."
];

const ChatPage = ({ messages, input, setInput, handleSendMessage, setMessages, isLoading }) => {
    const [showModal, setShowModal] = useState(false);
    const [documentData, setDocumentData] = useState({
        name: "John_Doe_Resume.pdf",
        uploadedAt: new Date().toISOString()
    });
    const messagesEndRef = useRef(null);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    // Rotate through loading messages
    useEffect(() => {
        let interval;
        if (messages.some(msg => msg.isLoading)) {
            interval = setInterval(() => {
                setLoadingMessageIndex(prev => (prev + 1) % loadingMessages.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [messages]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleCloseModal = () => {
        setShowModal(false);
    };

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
                        onClick={() => setShowModal(true)}
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
                    {/* Message rendering section with enhanced animations and markdown support */}
                    {messages.map((msg, idx) => (
                        <motion.div
                            key={idx}
                            initial="hidden"
                            animate="visible"
                            variants={messageVariants}
                            className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.sender === 'bot' && (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    {msg.isLoading ? 
                                        <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" /> : 
                                        <Bot className="h-4 w-4" />
                                    }
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
                                {msg.isLoading ? (
                                    <div className="flex flex-col space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <span>{loadingMessages[loadingMessageIndex]}</span>
                                            <PulseLoader size={4} color="#888" speedMultiplier={0.7} />
                                        </div>
                                        <div className="w-full bg-muted/50 h-1 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-primary/70"
                                                initial={{ width: 0 }}
                                                animate={{ width: "100%" }}
                                                transition={{ 
                                                    repeat: Infinity, 
                                                    duration: 2,
                                                    ease: "easeInOut" 
                                                }}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="markdown-content prose prose-sm dark:prose-invert max-w-none">
                                        <ReactMarkdown 
                                            rehypePlugins={[rehypeRaw]} 
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                // Style code blocks
                                                code: ({node, inline, className, children, ...props}) => {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    return !inline && match ? (
                                                        <div className="bg-muted/70 rounded-md p-2 my-2 overflow-x-auto">
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        </div>
                                                    ) : (
                                                        <code className="bg-muted/50 px-1 py-0.5 rounded text-xs" {...props}>
                                                            {children}
                                                        </code>
                                                    );
                                                },
                                                // Style links
                                                a: ({node, className, children, ...props}) => (
                                                    <a className="text-primary underline" {...props}>
                                                        {children}
                                                    </a>
                                                ),
                                                // Style lists
                                                ul: ({node, className, children, ...props}) => (
                                                    <ul className="list-disc pl-4 my-2" {...props}>
                                                        {children}
                                                    </ul>
                                                ),
                                                ol: ({node, className, children, ...props}) => (
                                                    <ol className="list-decimal pl-4 my-2" {...props}>
                                                        {children}
                                                    </ol>
                                                ),
                                                // Style headings
                                                h1: ({node, className, children, ...props}) => (
                                                    <h1 className="text-lg font-bold my-2" {...props}>
                                                        {children}
                                                    </h1>
                                                ),
                                                h2: ({node, className, children, ...props}) => (
                                                    <h2 className="text-base font-bold my-2" {...props}>
                                                        {children}
                                                    </h2>
                                                ),
                                                h3: ({node, className, children, ...props}) => (
                                                    <h3 className="text-sm font-bold my-1" {...props}>
                                                        {children}
                                                    </h3>
                                                ),
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                )}
                            </div>
                            {msg.sender === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                    <User className="h-4 w-4" />
                                </div>
                            )}
                        </motion.div>
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
                            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendMessage(input)}
                            disabled={isLoading}
                        />
                        <Button
                            onClick={() => handleSendMessage(input)}
                            className="rounded-full px-3 h-8"
                            whileTap={{ scale: 0.95 }}
                            as={motion.button}
                            disabled={isLoading || !input.trim()}
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