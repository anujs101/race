import React, { useState, useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ChatPage from '../Components/ChatPage';
import LatexViewAndProgram from '../Components/LatexViewAndProgram';
import { Worker } from '@react-pdf-viewer/core';
import { motion } from 'framer-motion';

// Import dummy PDF data
import resume1 from '../assets/Resume/1.pdf';
import resume2 from '../assets/Resume/2.pdf';
import resume3 from '../assets/Resume/3.pdf';

const ChatLatex = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! How can I assist you with your resume today?' },
    ]);
    const [input, setInput] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [base64Data, setBase64Data] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentResumeIndex, setCurrentResumeIndex] = useState(0);
    const canvasRef = useRef(null);
    
    // Array of resume PDFs
    const resumePdfs = [resume1, resume2, resume3];

    // Load the first resume on component mount
    useEffect(() => {
        loadInitialResume();
    }, []);

    const loadInitialResume = async () => {
        try {
            const response = await fetch(resumePdfs[0]);
            const blob = await response.blob();
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64data = reader.result.split(',')[1];
                setBase64Data(base64data);
            };
            reader.readAsDataURL(blob);
        } catch (error) {
            console.error('Error loading initial resume:', error);
        }
    };

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;
        const newMessages = [...messages, { sender: 'user', text: message }];
        setMessages(newMessages);
        setInput('');
        
        // Add loading indicator with animation
        setIsLoading(true);
        setMessages([...newMessages, { sender: 'bot', text: 'Generating response...', isLoading: true }]);

        // Show PDF loading animation in the LatexViewAndProgram component
        document.dispatchEvent(new CustomEvent('pdf-loading-start'));

        // Simulate API delay
        setTimeout(async () => {
            try {
                // Increment resume index (cycle through 1, 2, 3)
                const nextIndex = (currentResumeIndex + 1) % resumePdfs.length;
                setCurrentResumeIndex(nextIndex);
                
                // Load the next resume
                const response = await fetch(resumePdfs[nextIndex]);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result.split(',')[1];
                    setBase64Data(base64data);
                    
                    // Trigger PDF loaded event
                    document.dispatchEvent(new CustomEvent('pdf-loading-complete'));
                    
                    // Remove loading message and add dummy response
                    const messagesWithoutLoading = newMessages.filter(msg => !msg.isLoading);
                    const dummyResponses = [
                        "I've updated your resume to highlight your technical skills more prominently. The new version emphasizes your project achievements and quantifies your impact better.",
                        "Your resume now has a more modern layout with improved readability. I've also enhanced the professional summary to better match current industry expectations.",
                        "I've restructured your experience section to showcase your leadership abilities. The updated format also creates more space for your accomplishments without making the document feel crowded."
                    ];
                    
                    setMessages([...messagesWithoutLoading, { 
                        sender: 'bot', 
                        text: dummyResponses[nextIndex] 
                    }]);
                    setIsLoading(false);
                };
                reader.readAsDataURL(blob);
            } catch (error) {
                console.error('Error loading next resume:', error);
                // Remove loading message and add error message
                const messagesWithoutLoading = newMessages.filter(msg => !msg.isLoading);
                setMessages([...messagesWithoutLoading, { 
                    sender: 'bot', 
                    text: 'Sorry, I encountered an error. Please try again.' 
                }]);
                setIsLoading(false);
                // Trigger PDF loading error event
                document.dispatchEvent(new CustomEvent('pdf-loading-error'));
            }
        }, 5000); // 5 second delay
    };

    return (
        <motion.div 
            className="h-[85vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="h-full">
                <PanelGroup direction="horizontal" className="w-full h-full">
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full p-4">
                            <LatexViewAndProgram
                                isPreview={isPreview}
                                base64Data={base64Data}
                                setBase64Data={setBase64Data}
                                pdfDataUrl={`data:application/pdf;base64,${base64Data}`}
                                setIsPreview={setIsPreview}
                                isLoading={isLoading}
                            />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors">
                        <motion.div 
                            className="h-full w-1 mx-auto bg-border rounded-full"
                            whileHover={{ scale: 1.5 }}
                        ></motion.div>
                    </PanelResizeHandle>
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full">
                            <ChatPage
                                messages={messages}
                                input={input}
                                setInput={setInput}
                                handleSendMessage={handleSendMessage}
                                setMessages={setMessages}
                                isLoading={isLoading}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </motion.div>
    );
}

export default ChatLatex;