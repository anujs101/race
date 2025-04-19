import React, { useState, useEffect, useRef } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import ChatPage from '../Components/ChatPage';
import LatexViewAndProgram from '../Components/LatexViewAndProgram';
import { Worker } from '@react-pdf-viewer/core';
import axios from 'axios';

const ChatLatex = () => {
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hello! How can I assist you with your resume today?' },
    ]);
    const [input, setInput] = useState('');
    const [isPreview, setIsPreview] = useState(false);
    const [base64Data, setBase64Data] = useState('');
    const canvasRef = useRef(null);

    const handleSendMessage = async (message) => {
        if (!message.trim()) return;
        const newMessages = [...messages, { sender: 'user', text: message }];
        setMessages(newMessages);
        setInput('');

        try {
            const response = await axios.post('YOUR_API_ENDPOINT', { message });
            setMessages([...newMessages, { sender: 'bot', text: response.data.message }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages([...newMessages, { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' }]);
        }
    };

    const pdfDataUrl = `data:application/pdf;base64,${base64Data}`;

    return (
        <div className="h-[85vh]">
            <div className="h-full">
                <PanelGroup direction="horizontal" className="w-full h-full">
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full p-4">
                            <LatexViewAndProgram
                                isPreview={isPreview}
                                base64Data={base64Data}
                                setBase64Data={setBase64Data}
                                pdfDataUrl={pdfDataUrl}
                                setIsPreview={setIsPreview}
                            />
                        </div>
                    </Panel>
                    <PanelResizeHandle className="w-2 bg-border hover:bg-primary/20 transition-colors">
                        <div className="h-full w-1 mx-auto bg-border rounded-full"></div>
                    </PanelResizeHandle>
                    <Panel defaultSize={50} minSize={20}>
                        <div className="h-full">
                            <ChatPage
                                messages={messages}
                                input={input}
                                setInput={setInput}
                                handleSendMessage={handleSendMessage}
                            />
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}

export default ChatLatex;