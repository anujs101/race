#!/usr/bin/env python
"""
Job Matching Script - Extracts functionality from enhancer.ipynb
Takes JSON input via command line and returns matching jobs as JSON output
"""

import sys
import json
import time
import os
import argparse
from sentence_transformers import SentenceTransformer
import numpy as np
import faiss
import requests
from datetime import datetime

# Path to the virtual environment if needed
# import sys
# sys.path.append('/path/to/your/venv/lib/python3.x/site-packages')

# Configure SerpAPI key (from environment or use a default from notebook)
SERPAPI_KEY = os.environ.get('SERPAPI_KEY', '83c1ef3c99b32b05ab29da61937948e1cce626b355feb3c4c6ead197a08a7aac')

def get_multiple_jobs_with_pagination(job_title, location, limit=5):
    """
    Fetch jobs from SerpAPI based on job title and location
    Returns a dictionary of job details
    """
    try:
        params = {
            "engine": "google_jobs",
            "q": job_title,
            "location": location,
            "api_key": SERPAPI_KEY,
            "hl": "en"
        }
        
        all_jobs = []
        next_page_token = None
        
        # Fetch jobs with pagination until we have enough or no more pages
        while len(all_jobs) < limit:
            if next_page_token:
                params["next_page_token"] = next_page_token
            else:
                params.pop("next_page_token", None)
                
            # Make the API request
            response = requests.get("https://serpapi.com/search", params=params)
            if response.status_code != 200:
                raise Exception(f"SerpAPI request failed with status {response.status_code}: {response.text}")
                
            data = response.json()
            
            # Extract jobs from response
            jobs = data.get("jobs_results", [])
            if not jobs:
                break
                
            all_jobs.extend(jobs)
            
            # Get pagination token for next page
            serpapi_pagination = data.get("serpapi_pagination", {})
            next_page_token = serpapi_pagination.get("next_page_token")
            
            if not next_page_token:
                break
                
            # Avoid rate limiting
            time.sleep(1)
        
        # Limit to requested number of jobs
        all_jobs = all_jobs[:limit]
        
        # Format the job results
        result = []
        for job in all_jobs:
            application_link = ""
            if 'apply_options' in job and job['apply_options']:
                application_link = job['apply_options'][0].get('link', '')
            elif 'via' in job:
                application_link = job['via']
            else:
                application_link = job.get('detected_extensions', {}).get('apply_link', '')
            
            # Add to results with a clean structure
            result.append({
                "title": job.get('title', ''),
                "company": job.get('company_name', ''),
                "location": job.get('location', ''),
                "description": job.get('description', ''),
                "applicationLink": application_link,
                "postedTime": job.get('detected_extensions', {}).get('posted_at', ''),
                "jobType": job.get('detected_extensions', {}).get('job_type', '')
            })
            
        return result
    except Exception as e:
        print(f"Error fetching jobs: {str(e)}", file=sys.stderr)
        return []

def find_matching_jobs(resume_text=None, job_title=None, location=None, limit=5, embedding_model=None):
    """
    Find jobs matching a resume or job title/location
    Uses embeddings to rank results if resume_text is provided
    """
    try:
        # If no embedding model is provided, load it
        if embedding_model is None:
            embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
            
        # Get jobs from SerpAPI
        jobs = get_multiple_jobs_with_pagination(job_title, location, limit=limit)
        
        # If no resume text, just return the jobs without ranking
        if not resume_text:
            return {
                "status": "success",
                "data": {
                    "matches": jobs,
                    "metadata": {
                        "query": {
                            "jobTitle": job_title,
                            "location": location
                        },
                        "total": len(jobs),
                        "generatedAt": datetime.now().isoformat()
                    }
                }
            }
        
        # If we have resume text, use embeddings to rank the jobs
        job_descriptions = [job["description"] for job in jobs]
        
        # Generate embeddings
        resume_embedding = embedding_model.encode([resume_text]).astype("float32")
        job_embeddings = embedding_model.encode(job_descriptions).astype("float32")
        
        # Use FAISS for efficient similarity search
        dimension = job_embeddings.shape[1]
        index = faiss.IndexFlatL2(dimension)
        index.add(job_embeddings)
        
        # Search for similar jobs
        distances, indices = index.search(resume_embedding, len(jobs))
        
        # Normalize distances to similarity scores (higher is better)
        # Since FAISS returns L2 distances (lower is better), we convert to similarity
        max_distance = np.max(distances) if len(distances) > 0 and len(distances[0]) > 0 else 1
        similarities = [1 - (distance / max_distance) for distance in distances[0]]
        
        # Sort jobs by similarity
        ranked_jobs = []
        for i, idx in enumerate(indices[0]):
            if idx < len(jobs):  # Safety check
                job = jobs[idx].copy()
                job["similarityScore"] = float(similarities[i])
                ranked_jobs.append(job)
        
        # Sort by similarity score (highest first)
        ranked_jobs.sort(key=lambda x: x["similarityScore"], reverse=True)
        
        return {
            "status": "success",
            "data": {
                "matches": ranked_jobs,
                "metadata": {
                    "query": {
                        "jobTitle": job_title,
                        "location": location
                    },
                    "total": len(ranked_jobs),
                    "generatedAt": datetime.now().isoformat()
                }
            }
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Error finding matching jobs: {str(e)}"
        }

def main():
    """
    Main function to parse command line arguments and execute job matching
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
        location = params.get("location", "")
        limit = int(params.get("limit", 5))
        
        # Validate required parameters
        if not job_title:
            print(json.dumps({
                "status": "error",
                "message": "Job title is required"
            }))
            return
            
        # Execute job matching
        result = find_matching_jobs(
            resume_text=resume_text,
            job_title=job_title,
            location=location,
            limit=limit
        )
        
        # Return result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "message": f"Error executing job matching: {str(e)}"
        }))

if __name__ == "__main__":
    main() 