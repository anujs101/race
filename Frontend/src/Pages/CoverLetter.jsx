import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Upload, ArrowRight, Check, Crown, Loader2 } from 'lucide-react';
// Import static PDFs
import frontendResumeFile from '../assets/Resume/frontendRoleJob.pdf';
import coverLetterFile from '../assets/Resume/coverletter.pdf';

const CoverLetter = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generationStatus, setGenerationStatus] = useState('idle'); // idle, generating, complete
  const [activeTab, setActiveTab] = useState('upload');
  const [generatedData, setGeneratedData] = useState({
    resume: null,
    coverLetter: null
  });
  const [error, setError] = useState(null);

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

  // Function to convert a file to base64
  const fileToBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract the base64 part from the data URL
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Function to fetch and convert static PDFs to base64
  const fetchStaticPDFs = async () => {
    try {
      // Fetch the resume PDF
      const resumeResponse = await fetch(frontendResumeFile);
      const resumeBlob = await resumeResponse.blob();
      
      // Fetch the cover letter PDF
      const coverLetterResponse = await fetch(coverLetterFile);
      const coverLetterBlob = await coverLetterResponse.blob();
      
      // Convert both to base64
      const resumeBase64 = await fileToBase64(resumeBlob);
      const coverLetterBase64 = await fileToBase64(coverLetterBlob);
      
      return {
        resume: resumeBase64,
        coverLetter: coverLetterBase64
      };
    } catch (error) {
      console.error('Error fetching static PDFs:', error);
      throw error;
    }
  };

  const generateDocuments = async () => {
    if (!jobDescription || !uploadedFile || !jobTitle) {
      return;
    }
    
    setGenerationStatus('generating');
    setError(null);
    
    try {
      // Simulate API delay (5-6 seconds)
      setTimeout(async () => {
        try {
          // Get the static PDFs
          const staticPDFs = await fetchStaticPDFs();
          
          // Set the generated data
          setGeneratedData({
            resume: staticPDFs.resume,
            coverLetter: staticPDFs.coverLetter
          });
          
          setGenerationStatus('complete');
          setActiveTab('results');
        } catch (err) {
          console.error('Error generating documents:', err);
          setError('Failed to generate documents. Please try again.');
          setGenerationStatus('idle');
        }
      }, 5500); // 5.5 seconds delay
    } catch (err) {
      console.error('Error generating documents:', err);
      setError('Failed to generate documents. Please try again.');
      setGenerationStatus('idle');
    }
  };

  const downloadDocument = (docType) => {
    const data = docType === 'resume' ? generatedData.resume : generatedData.coverLetter;
    const fileName = docType === 'resume' ? 'tailored-resume.pdf' : 'cover-letter.pdf';
    
    if (!data) return;
    
    // Create a blob from the data
    const blob = new Blob([atob(data)], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
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

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

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
              <CardTitle>Job Details</CardTitle>
              <CardDescription>
                Enter the job title and paste the job description to customize your resume and cover letter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="job-title">Job Title</Label>
                <Input
                  id="job-title"
                  placeholder="Enter job title..."
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="job-description">Job Description</Label>
                <Textarea
                  id="job-description"
                  placeholder="Paste job description here..."
                  className="min-h-64"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('upload')}>
                Back
              </Button>
              <Button 
                onClick={generateDocuments} 
                disabled={!jobDescription || !jobTitle || generationStatus === 'generating'}
              >
                {generationStatus === 'generating' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : 'Generate Documents'}
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
                    {generatedData.resume ? (
                      <iframe 
                        src={`data:application/pdf;base64,${generatedData.resume}`} 
                        className="w-full h-full"
                        title="Tailored Resume"
                      />
                    ) : (
                      <FileText className="w-16 h-16 text-gray-300" />
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => downloadDocument('resume')}
                      disabled={!generatedData.resume}
                    >
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
                    {generatedData.coverLetter ? (
                      <iframe 
                        src={`data:application/pdf;base64,${generatedData.coverLetter}`} 
                        className="w-full h-full"
                        title="Cover Letter"
                      />
                    ) : (
                      <FileText className="w-16 h-16 text-gray-300" />
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => downloadDocument('coverLetter')}
                      disabled={!generatedData.coverLetter}
                    >
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