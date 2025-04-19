import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import LatexRenderer from './LatexRender';

const LatexViewAndProgram = () => {
  const [isPreview, setIsPreview] = useState(false);
  const [code, setCode] = useState(`\\documentclass{article}
\\begin{document}
\\section*{Sample}
This is a simple LaTeX A4 document.

Some math: $E = mc^2$
\\end{document}`);

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Mode toggle */}
      <div className="flex items-center space-x-2">
        <Label htmlFor="mode-switch">Code</Label>
        <Switch
          id="mode-switch"
          checked={isPreview}
          onCheckedChange={setIsPreview}
        />
        <Label htmlFor="mode-switch">Preview</Label>
      </div>

      {/* A4 container with proper overflow handling */}
      <div className="flex-grow relative">
        <div 
          className="border rounded-lg shadow-lg overflow-auto mx-auto absolute inset-0"
          style={{ maxWidth: '210mm', maxHeight: '297mm' }}
        >
          {isPreview ? (
            // Rendered LaTeX → HTML using LatexRenderer
            <div className="p-4 bg-white h-full">
              <LatexRenderer latexString={code} />
            </div>
          ) : (
            // Code editor
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full w-full border-0 focus:ring-0 font-mono resize-none"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LatexViewAndProgram;