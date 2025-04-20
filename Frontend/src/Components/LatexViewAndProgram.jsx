import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { motion } from 'framer-motion';
import { Sparkles, FileText, RefreshCw } from 'lucide-react';
import Lottie from 'react-lottie-player';

const LatexViewAndProgram = ({ base64Data, setBase64Data, isPreview, setIsPreview, isLoading }) => {
  const [localIsLoading, setLocalIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Preparing your document...");
  const [animationData, setAnimationData] = useState(null);
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const pdfDataUrl = `data:application/pdf;base64,${base64Data}`;
  
  // Fetch the animation data
  useEffect(() => {
    // Use a local animation file or a reliable CDN source
    fetch('https://assets.lottiefiles.com/packages/lf20_szlepvdh.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => {
        console.error('Error loading animation:', error);
        // Fallback animation data if needed
      });
  }, []);
  
  // Loading messages for PDF generation
  const loadingMessages = [
    "Crafting your professional document...",
    "Formatting your resume to perfection...",
    "Optimizing layout for maximum impact...",
    "Applying professional styling...",
    "Preparing to showcase your talents...",
    "Creating a document that stands out..."
  ];

  // Listen for PDF loading events
  useEffect(() => {
    const handleLoadingStart = () => {
      setLocalIsLoading(true);
      
      // Rotate through loading messages
      let messageIndex = 0;
      const interval = setInterval(() => {
        setLoadingMessage(loadingMessages[messageIndex]);
        messageIndex = (messageIndex + 1) % loadingMessages.length;
      }, 3000);
      
      return () => clearInterval(interval);
    };
    
    const handleLoadingComplete = () => {
      setLocalIsLoading(false);
    };
    
    const handleLoadingError = () => {
      setLocalIsLoading(false);
      setLoadingMessage("Error generating document. Please try again.");
    };
    
    document.addEventListener('pdf-loading-start', handleLoadingStart);
    document.addEventListener('pdf-loading-complete', handleLoadingComplete);
    document.addEventListener('pdf-loading-error', handleLoadingError);
    
    return () => {
      document.removeEventListener('pdf-loading-start', handleLoadingStart);
      document.removeEventListener('pdf-loading-complete', handleLoadingComplete);
      document.removeEventListener('pdf-loading-error', handleLoadingError);
    };
  }, []);

  return (
    <div className="p-1 space-y-4 h-full flex flex-col">
      <div className="flex-grow relative">
        <div 
          className="border rounded-lg shadow-lg overflow-auto mx-auto absolute inset-0"
          style={{ maxWidth: '210mm', maxHeight: '297mm' }}
        >
          {localIsLoading || isLoading ? (
            <motion.div 
              className="h-full w-full flex flex-col items-center justify-center bg-muted/10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {animationData ? (
                <Lottie
                  animationData={animationData}
                  play
                  loop
                  style={{ height: '200px', width: '200px' }}
                />
              ) : (
                <div className="animate-spin">
                  <RefreshCw className="h-12 w-12 text-primary/70" />
                </div>
              )}
              <motion.div
                className="flex items-center gap-2 mt-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Sparkles className="h-5 w-5 text-amber-500" />
                <p className="text-lg font-medium text-primary">{loadingMessage}</p>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </motion.div>
              <motion.div 
                className="w-64 h-2 bg-muted mt-6 rounded-full overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut" 
                  }}
                />
              </motion.div>
            </motion.div>
          ) : base64Data ? (
            // Rendered PDF using react-pdf-viewer
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfDataUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          ) : (
            // Empty state
            <div className="h-full w-full flex flex-col items-center justify-center">
              <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground text-center max-w-xs">
                Your resume will appear here after you chat with the AI assistant
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatexViewAndProgram;