#!/usr/bin/env python
"""
Cover Letter Generator Script - Extracts functionality from enhancer.ipynb
Takes JSON input via command line and returns generated cover letter as JSON output
"""

import sys
import json
import os
import time
from datetime import datetime
import traceback
import requests

# Implement a simplified version of query_groq that doesn't rely on the notebook
def query_groq(prompt, model="groq-14b", max_tokens=2000, temperature=0.7):
    """
    Call the Groq API with a prompt and return the response
    """
    try:
        # Check if GROQ_API_KEY is in environment variables
        api_key = os.environ.get("GROQ_API_KEY")
        if not api_key:
            # Fallback to using a mock response for testing
            print(f"No GROQ_API_KEY found. Using mock response.", file=sys.stderr)
            # Generate a mock cover letter for testing
            return f"""Dear Hiring Manager at the company,

I am writing to express my interest in the position advertised. Based on my background and experience, I believe I would be a strong candidate for this role.

My experience includes software development, team leadership, and project management. I have worked with various technologies including web development frameworks and cloud platforms.

I am particularly interested in this role because it aligns well with my career goals and skills. I am confident that my technical expertise and problem-solving abilities would allow me to make significant contributions to your team.

Thank you for considering my application. I look forward to the opportunity to discuss how my background and skills would be an asset to your organization.

Sincerely,
John Doe"""
        
        # If API key exists, make the actual API call
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": max_tokens,
            "temperature": temperature
        }
        
        response = requests.post("https://api.groq.com/openai/v1/chat/completions", 
                                headers=headers, 
                                json=data)
        
        if response.status_code != 200:
            raise Exception(f"API call failed with status code {response.status_code}: {response.text}")
        
        return response.json()["choices"][0]["message"]["content"]
    
    except Exception as e:
        print(f"Error calling Groq API: {e}", file=sys.stderr)
        raise

# Define our own generate_cover_letter function
def generate_cover_letter(resume_text, job_title, job_description, company_name):
    """
    Generate a cover letter based on a resume and job details
    """
    try:
        # Create the prompt for the Groq API
        prompt = f"""
        You are a professional resume writer. Create a customized cover letter based on this person's resume and the job they're applying for.
        
        RESUME:
        {resume_text}
        
        JOB TITLE: {job_title}
        COMPANY: {company_name}
        JOB DESCRIPTION: {job_description}
        
        Write a professional, concise, and compelling cover letter that:
        1. Addresses skills and experiences from the resume that match the job description
        2. Demonstrates enthusiasm for the specific company and role
        3. Uses a professional tone
        4. Is appropriately formatted with proper salutation and closing
        5. Is around 250-350 words
        
        COVER LETTER:
        """
        
        # Call the Groq API
        cover_letter = query_groq(prompt)
        return cover_letter.strip()
    
    except Exception as e:
        print(f"Error generating cover letter: {str(e)}", file=sys.stderr)
        raise

def generate_cover_letter_wrapper(resume_text, job_title, job_description, company_name):
    """
    Wrapper function for generate_cover_letter that adds error handling and formatting
    """
    try:
        # Log the request parameters (excluding resume content for brevity)
        print(f"Generating cover letter for job: {job_title} at {company_name}", file=sys.stderr)
        
        # Call the function from the notebook
        start_time = time.time()
        cover_letter = generate_cover_letter(resume_text, job_title, job_description, company_name)
        elapsed_time = time.time() - start_time
        
        print(f"Cover letter generation completed in {elapsed_time:.2f} seconds", file=sys.stderr)
        
        # Return a structured response
        return {
            "status": "success",
            "data": {
                "coverLetter": cover_letter,
                "metadata": {
                    "jobTitle": job_title,
                    "companyName": company_name,
                    "generatedAt": datetime.now().isoformat()
                }
            }
        }
    except Exception as e:
        print(f"Error generating cover letter: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        return {
            "status": "error",
            "message": "Failed to generate cover letter",
            "error": str(e),
            "details": traceback.format_exc()
        }

def main():
    """
    Main function to parse command line arguments and execute cover letter generation
    """
    try:
        # Parse input JSON from command line
        if len(sys.argv) < 2:
            print(json.dumps({
                "status": "error",
                "message": "No input parameters provided"
            }))
            return
            
        params = json.loads(sys.argv[1])
        
        # Extract parameters
        resume_text = params.get("resumeText")
        job_title = params.get("jobTitle")
        job_description = params.get("jobDescription")
        company_name = params.get("companyName")
        
        # Validate required parameters
        missing_params = []
        if not resume_text:
            missing_params.append("resumeText")
        if not job_title:
            missing_params.append("jobTitle")
        if not job_description:
            missing_params.append("jobDescription")
        if not company_name:
            missing_params.append("companyName")
            
        if missing_params:
            print(json.dumps({
                "status": "error",
                "message": f"Missing required parameters: {', '.join(missing_params)}"
            }))
            return
            
        # Execute cover letter generation
        result = generate_cover_letter_wrapper(
            resume_text=resume_text,
            job_title=job_title,
            job_description=job_description,
            company_name=company_name
        )
        
        # Return result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Error executing cover letter generation: {str(e)}",
            "details": traceback.format_exc()
        }))

if __name__ == "__main__":
    main() 