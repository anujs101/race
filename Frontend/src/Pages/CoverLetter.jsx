import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Upload, ArrowRight, Check, Crown } from 'lucide-react';

const CoverLetter = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, complete
  const [activeTab, setActiveTab] = useState('upload');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const generateDocuments = () => {
    if (!jobDescription || !uploadedFile) {
      return;
    }
    
    setGenerationStatus('generating');
    
    // Simulate generation process
    setTimeout(() => {
      setGenerationStatus('complete');
      setActiveTab('results');
    }, 3000);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Resume Enhancer</h1>
        <div className="flex items-center bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
          <Crown className="w-4 h-4 mr-2" />
          <span className="text-sm font-medium">Premium</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="upload">Upload Resume</TabsTrigger>
          <TabsTrigger value="job">Job Description</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
              <CardDescription>
                Drag and drop your existing resume or click to browse files
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => document.getElementById('resume-upload').click()}
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Upload className="h-10 w-10 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {uploadedFile ? uploadedFile.name : 'Drop your resume here or click to browse'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Supports PDF, DOCX, or TXT files
                    </p>
                  </div>
                  <input 
                    id="resume-upload" 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={() => setActiveTab('job')} 
                disabled={!uploadedFile}
              >
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
              <CardDescription>
                Paste the job description to customize your resume and cover letter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Paste job description here..."
                className="min-h-64"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('upload')}>
                Back
              </Button>
              <Button 
                onClick={generateDocuments} 
                disabled={!jobDescription || generationStatus === 'generating'}
              >
                {generationStatus === 'generating' ? 'Generating...' : 'Generate Documents'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {generationStatus === 'complete' ? (
            <>
              <Alert className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Success!</AlertTitle>
                <AlertDescription className="text-green-700">
                  Your tailored resume and cover letter have been generated
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tailored Resume</CardTitle>
                    <CardDescription>
                      Customized to highlight relevant experience for this role
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 bg-gray-50 flex items-center justify-center border rounded-md">
                    <FileText className="w-16 h-16 text-gray-300" />
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Download Resume
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Cover Letter</CardTitle>
                    <CardDescription>
                      Custom cover letter based on your resume and the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-64 bg-gray-50 flex items-center justify-center border rounded-md">
                    <FileText className="w-16 h-16 text-gray-300" />
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Download Cover Letter
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Application Tips</CardTitle>
                  <CardDescription>
                    Based on our analysis of your resume and the job description
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Keyword Match</h3>
                    <div className="bg-gray-100 h-4 rounded-full overflow-hidden">
                      <div className="bg-green-500 h-full w-4/5" />
                    </div>
                    <p className="text-sm text-gray-600">Your resume now matches 80% of the key skills in the job description</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Suggested Follow-up</h3>
                    <p className="text-sm text-gray-600">Consider reaching out to the hiring manager on LinkedIn within 3-5 days of applying</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">No Documents Generated Yet</h3>
              <p className="text-gray-500 mt-2">Upload your resume and add a job description to get started</p>
              <Button onClick={() => setActiveTab('upload')} className="mt-6">
                Start Process
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoverLetter;