import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const LatexViewAndProgram = () => {
  const [isPreview, setIsPreview] = useState(false);
  const [base64Data, setBase64Data] = useState(''); // State for base64 data
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const pdfDataUrl = `data:application/pdf;base64,${base64Data}`;

  return (
    <div className="p-1 space-y-4 h-full flex flex-col">
      {/* Mode toggle */}
      {/* <div className="flex items-center space-x-2">
        <Label htmlFor="mode-switch">Code</Label>
        <Switch
          id="mode-switch"
          checked={isPreview}
          onCheckedChange={setIsPreview}
        />
        <Label htmlFor="mode-switch">Preview</Label>
      </div> */}

      {/* A4 container with proper overflow handling */}
      <div className="flex-grow relative">
        <div 
          className="border rounded-lg shadow-lg overflow-auto mx-auto absolute inset-0"
          style={{ maxWidth: '210mm', maxHeight: '297mm' }}
        >
          {1     ? (
            // Rendered PDF using react-pdf-viewer
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfDataUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </Worker>
          ) : (
            // Code editor for testing
            <textarea
              value={base64Data}
              onChange={(e) => setBase64Data(e.target.value)}
              className="h-full w-full border-0 focus:ring-0 font-mono resize-none"
              placeholder="Enter base64 encoded PDF here..."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LatexViewAndProgram;