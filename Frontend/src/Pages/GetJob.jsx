import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExternalLink, MapPin, Building, Clock, Briefcase, Search, Loader2 } from 'lucide-react';
import axios from 'axios';

const GetJob = () => {
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [jobMatches, setJobMatches] = useState(null);
  const baseUrl = "https://49d8-103-104-226-58.ngrok-free.app/api/";

  const handleSearch = async () => {
    if (!jobTitle || !location) {
      setError('Please enter both job title and location');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get auth token from localStorage
      const authToken = localStorage.getItem('authToken');
      
      if (!authToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Make API request
      const response = await axios.post(
        `${baseUrl}jobs/find-matches`,
        {
          jobTitle,
          location
        },
        {
          headers: {
            'Authorization': `${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Handle successful response
      if (response.data && response.data.status === 'success') {
        setJobMatches(response.data.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error finding job matches:', err);
      setError(err.response?.data?.message || err.message || 'Failed to find job matches');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to format description text with line breaks
  const formatDescription = (description) => {
    return description.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Find Your Dream Job</h1>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Job Search</CardTitle>
          <CardDescription>
            Enter your desired job title and location to find matching opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                placeholder="e.g. Software Engineer, Product Manager"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. Mumbai, New York, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleSearch} 
            disabled={isLoading || !jobTitle || !location}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Find Jobs
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertTitle className="text-red-800">Error</AlertTitle>
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {jobMatches && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              {jobMatches.matches.length} Jobs Found
            </h2>
            <p className="text-sm text-muted-foreground">
              for {jobMatches.metadata.query.jobTitle} in {jobMatches.metadata.query.location}
            </p>
          </div>

          {jobMatches.matches.map((job, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{job.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-sm flex items-center text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {job.postedTime}
                    </span>
                    {job.jobType && (
                      <span className="text-sm flex items-center mt-1 text-muted-foreground">
                        <Briefcase className="h-3 w-3 mr-1" />
                        {job.jobType}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                </div>
                <div className="text-sm line-clamp-4 mb-4">
                  {formatDescription(job.description)}
                </div>
              </CardContent>
              <CardFooter className="bg-muted/20 flex justify-between">
                <Button variant="outline" size="sm">
                  Save Job
                </Button>
                <Button 
                  size="sm"
                  onClick={() => window.open(job.applicationLink, '_blank')}
                  className="flex items-center"
                >
                  Apply Now
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}

          <div className="text-center text-sm text-muted-foreground">
            Results generated on {new Date(jobMatches.metadata.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GetJob;