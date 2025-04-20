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

# Path to enhancer notebook directory
NOTEBOOK_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "py_models")
sys.path.append(NOTEBOOK_DIR)

# Dynamically import the generate_cover_letter function
try:
    # First try to import directly in case it's been refactored into a module
    try:
        from enhancer import generate_cover_letter
    except ImportError:
        # If direct import fails, we'll need to extract from the notebook
        import nbformat
        from nbformat import read
        import re

        def extract_function_from_notebook(notebook_path, function_name):
            """Extract a function from a Jupyter notebook file"""
            with open(notebook_path, 'r', encoding='utf-8') as f:
                nb = read(f, as_version=4)
            
            # Find the cell with the function definition
            function_code = ""
            found = False
            pattern = rf"def\s+{function_name}\s*\("
            
            for cell in nb.cells:
                if cell.cell_type == 'code':
                    if re.search(pattern, cell.source):
                        function_code = cell.source
                        found = True
                        break
            
            if not found:
                raise ValueError(f"Function '{function_name}' not found in notebook")
            
            # Execute the code to define the function in the current namespace
            exec(function_code, globals())
            
            # Return the function object
            return globals()[function_name]

        # Get the function from the notebook
        notebook_path = os.path.join(NOTEBOOK_DIR, "enhancer.ipynb")
        generate_cover_letter = extract_function_from_notebook(notebook_path, "generate_cover_letter")

except Exception as e:
    print(json.dumps({
        "status": "error",
        "message": f"Failed to import generate_cover_letter function: {str(e)}",
        "details": traceback.format_exc()
    }))
    sys.exit(1)

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