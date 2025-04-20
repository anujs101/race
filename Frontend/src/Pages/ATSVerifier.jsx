import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, AlertCircle, Briefcase, Award, BarChart3, Loader2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjs from 'pdfjs-dist';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AtsVerifier = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [error, setError] = useState(null);
  const [industryAverage, setIndustryAverage] = useState(68);
  
  // Initialize Google Generative AI with your API key
  const genAI = new GoogleGenerativeAI("AIzaSyD3NGKAA96CLRJn_aVcZ2emorJsQtFks7k");
  
  const handleFileChange = async (e) => {
    if (e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      
      try {
        // Read file content
        if (selectedFile.type === 'application/pdf') {
          const arrayBuffer = await selectedFile.arrayBuffer();
          const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
          }
          
          setFileContent(fullText);
        } else if (selectedFile.type === 'text/plain') {
          const text = await selectedFile.text();
          setFileContent(text);
        } else {
          // For other file types, show a warning but still allow upload
          setFileContent("File content extraction limited. For best results, use PDF or TXT files.");
        }
      } catch (err) {
        console.error("File reading error:", err);
        setError("Error reading file: " + err.message);
      }
    }
  };

  const analyzeResumeWithAI = async (resumeText, jobDesc) => {
    try {
      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      // Create a prompt for ATS analysis
      const prompt = `
        You are an expert ATS (Applicant Tracking System) analyzer with deep knowledge of industry standards and recruitment practices.
        
        Analyze the following resume against the job description provided. Be extremely thorough and accurate.
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDesc}
        
        Provide a detailed analysis in JSON format with the following structure:
        {
          "score": (overall ATS score as a number between 0-100, be realistic and accurate),
          "keywordMatch": (percentage of keywords matched as a number between 0-100),
          "formatScore": (score for resume format and structure between 0-100),
          "readabilityScore": (score for readability between 0-100),
          "bestFitRoles": [array of 3-5 job roles this resume is best suited for based on skills and experience],
          "matchedKeywords": [array of all matched keywords found in both resume and job description, be comprehensive],
          "missedKeywords": [array of important keywords from job description missing in resume],
          "improvementSuggestions": [array of 4-6 specific, actionable suggestions to improve the resume for this job],
          "resumeStrengths": [array of 3 specific strengths of this resume],
          "competitorScores": {
            "Indeed": (estimated score on Indeed between 0-100),
            "LinkedIn": (estimated score on LinkedIn between 0-100),
            "Glassdoor": (estimated score on Glassdoor between 0-100),
            "ZipRecruiter": (estimated score on ZipRecruiter between 0-100)
          }
        }
        
        Be extremely accurate and realistic in your assessment. Base your scores on actual ATS behavior and industry standards.
        Ensure all scores are justified by the content of the resume and job description.
      `;
      
      // Generate content
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      try {
        // Find JSON in the response (in case there's additional text)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : text;
        const parsedResult = JSON.parse(jsonString);
        
        // Add resume strengths if not provided by AI
        if (!parsedResult.resumeStrengths) {
          parsedResult.resumeStrengths = [
            "Clear presentation of skills and experience",
            "Proper use of industry terminology",
            "Well-structured employment history"
          ];
        }
        
        return parsedResult;
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        throw new Error("Failed to parse AI response");
      }
    } catch (error) {
      console.error("Error analyzing resume with AI:", error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume");
      return;
    }
    
    if (!jobDescription) {
      setError("Please provide a job description");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Analyze the resume using AI
      const analysisResults = await analyzeResumeWithAI(fileContent, jobDescription);
      
      // Calculate industry comparison
      const industryComparison = analysisResults.score - industryAverage;
      analysisResults.industryComparison = industryComparison;
      
      setResults(analysisResults);
    } catch (err) {
      setError("Error analyzing resume: " + (err.message || "Unknown error"));
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">ATS Score Analyzer</h1>
      <p className="text-muted-foreground mb-8">Optimize your resume for Applicant Tracking Systems</p>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>
              Upload your resume and provide a job description to analyze ATS compatibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {file ? file.name : 'Drag and drop your resume or click to browse'}
              </p>
              <Input 
                type="file" 
                accept=".pdf,.txt" 
                onChange={handleFileChange}
                className="max-w-sm mx-auto"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Supported formats: PDF, TXT (PDF recommended for best results)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="job-description">Job Description</Label>
              <textarea 
                id="job-description"
                className="min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Paste the job description here for better analysis..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleAnalyze} 
              disabled={!file || !jobDescription || isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                'Analyze Resume'
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ATS Analysis Results</CardTitle>
            <CardDescription>
              {results ? 'Detailed insights about your resume performance' : 'Upload your resume to see analysis results'}
            </CardDescription>
          </CardHeader>
          
          {!results ? (
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Upload your resume and click "Analyze Resume" to see detailed insights</p>
              </div>
            </CardContent>
          ) : (
            <CardContent className="p-0">
              <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger 
                    value="overview" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger 
                    value="keywords" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Keywords
                  </TabsTrigger>
                  <TabsTrigger 
                    value="suggestions" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Suggestions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="comparison" 
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
                  >
                    Comparison
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="relative inline-block">
                          <svg className="w-32 h-32">
                            <circle
                              className="text-muted-foreground/20"
                              strokeWidth="8"
                              stroke="currentColor"
                              fill="transparent"
                              r="56"
                              cx="64"
                              cy="64"
                            />
                            <circle
                              className="text-primary"
                              strokeWidth="8"
                              strokeDasharray={360}
                              strokeDashoffset={360 - (360 * results.score) / 100}
                              strokeLinecap="round"
                              stroke="currentColor"
                              fill="transparent"
                              r="56"
                              cx="64"
                              cy="64"
                            />
                          </svg>
                          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl font-bold">
                            {results.score}%
                          </span>
                        </div>
                        <p className="text-lg font-medium mt-2">Overall ATS Score</p>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Keyword Match</span>
                            <span className="text-sm font-medium">{results.keywordMatch}%</span>
                          </div>
                          <Progress value={results.keywordMatch} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Format & Structure</span>
                            <span className="text-sm font-medium">{results.formatScore}%</span>
                          </div>
                          <Progress value={results.formatScore} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">Readability</span>
                            <span className="text-sm font-medium">{results.readabilityScore}%</span>
                          </div>
                          <Progress value={results.readabilityScore} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Briefcase className="h-5 w-5 mr-2" />
                          Best Fit Roles
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {results.bestFitRoles.map((role, index) => (
                            <Badge key={index} variant="secondary" className="px-3 py-1">
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2 flex items-center">
                          <Award className="h-5 w-5 mr-2" />
                          Resume Strengths
                        </h3>
                        <ul className="space-y-1">
                          {results.resumeStrengths.map((strength, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                              <span className="text-sm">{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="keywords" className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                        Matched Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {results.matchedKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-3 flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                        Missing Keywords
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {results.missedKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 mt-4">
                      <h3 className="text-lg font-medium mb-3">Keyword Analysis</h3>
                      <div className="p-4 rounded-lg border bg-card">
                        <p className="text-sm mb-3">
                          Your resume matches {results.matchedKeywords.length} out of {results.matchedKeywords.length + results.missedKeywords.length} important keywords 
                          ({Math.round((results.matchedKeywords.length / (results.matchedKeywords.length + results.missedKeywords.length)) * 100)}% match rate).
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Recommendation:</span> Include the missing keywords in your resume where relevant to your experience.
                          Ensure keywords appear in context rather than just listing them.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="suggestions" className="p-6">
                  <h3 className="text-lg font-medium mb-4">Improvement Suggestions</h3>
                  <div className="space-y-4">
                    {results.improvementSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start p-3 rounded-lg border bg-card">
                        <AlertCircle className="h-5 w-5 mr-3 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-3">ATS-Friendly Format Tips</h3>
                      <div className="p-4 rounded-lg border bg-card">
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                            <span className="text-sm">Use standard section headings (Experience, Education, Skills)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                            <span className="text-sm">Avoid complex tables or multi-column layouts</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                            <span className="text-sm">Use a clean, simple font (Arial, Calibri, Times New Roman)</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                            <span className="text-sm">Include a skills section with relevant keywords</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="comparison" className="p-6">
                  <h3 className="text-lg font-medium mb-4 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    ATS Score Comparison
                  </h3>
                  
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      See how your resume performs across different ATS platforms
                    </p>
                    
                    {Object.entries(results.competitorScores).map(([platform, score]) => (
                      <div key={platform}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{platform}</span>
                          <span className="text-sm font-medium">{score}%</span>
                        </div>
                        <Progress value={score} className="h-2" />
                      </div>
                    ))}
                    
                    <div className="mt-6 p-4 rounded-lg border bg-card">
                      <h4 className="font-medium mb-2">Industry Average</h4>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Average ATS Score</span>
                        <span className="text-sm font-medium">{industryAverage}%</span>
                      </div>
                      <Progress value={industryAverage} className="h-2" />
                      <p className="text-sm text-muted-foreground mt-3">
                        {results.industryComparison > 0 ? (
                          `Your resume scores ${results.industryComparison.toFixed(1)}% higher than the industry average`
                        ) : results.industryComparison < 0 ? (
                          `Your resume scores ${Math.abs(results.industryComparison).toFixed(1)}% lower than the industry average`
                        ) : (
                          `Your resume matches the industry average score`
                        )}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AtsVerifier;