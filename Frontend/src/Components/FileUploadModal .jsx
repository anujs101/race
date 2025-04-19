import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

const FileUploadModal = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const validateFile = (file) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (validTypes.includes(file.type)) {
      setSelectedFile(file);
      return true;
    }
    alert("Please upload only PDF or DOCX files");
    return false;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      validateFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      validateFile(file);
    }
  };
  
  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      alert("Please select a file");
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = () => {
      const fileData = {
        name: selectedFile.name,
        type: selectedFile.type,
        size: selectedFile.size,
        content: reader.result,
        template: selectedTemplate,
        uploadedAt: new Date().toISOString()
      };
      
      localStorage.setItem('chatDocument', JSON.stringify(fileData));
      onClose();
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Please upload a PDF or DOCX file to continue
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-md p-6 transition-all duration-200 ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <Upload className={`h-10 w-10 mb-2 transition-colors ${
              isDragging ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <p className="text-sm text-muted-foreground mb-2 text-center">
              {isDragging 
                ? 'Drop your file here' 
                : 'Drag and drop your file here or click to browse'
              }
            </p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="w-full"
            />
            {selectedFile && (
              <p className="text-sm font-medium mt-2">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          
          <div>
            <h3 className="text-sm font-medium mb-2">Select Template</h3>
            <Tabs 
              defaultValue="default" 
              value={selectedTemplate} 
              onValueChange={handleTemplateChange}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="default">General</TabsTrigger>
                <TabsTrigger value="academic">Academic</TabsTrigger>
              </TabsList>
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <Button onClick={handleSubmit} className="w-full">
            Upload and Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadModal;