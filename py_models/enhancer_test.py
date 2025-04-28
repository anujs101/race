#!/usr/bin/env python3
"""
Test script for enhancer_wrapper.py
"""

import sys
import json
import os
import argparse
from pathlib import Path

def main():
    """Test the enhancer_wrapper.py script."""
    parser = argparse.ArgumentParser(description="Test enhancer_wrapper.py")
    parser.add_argument("--python", default="python3", help="Python executable to use")
    parser.add_argument("--wrapper", default="../py_models/enhancer_wrapper.py", help="Path to wrapper script")
    
    args = parser.parse_args()
    python_exec = args.python
    wrapper_script = args.wrapper
    
    # Test data
    test_data = {
        "data": {
            "resumeId": "123",
            "classification": {
                "contactInfo": {
                    "name": "John Doe",
                    "email": "john@example.com",
                    "phone": "123-456-7890",
                    "address": "123 Main St",
                    "linkedin": "linkedin.com/in/johndoe"
                },
                "education": ["BS Computer Science"],
                "experience": [
                    {
                        "role": "Software Developer",
                        "organization": "ABC Inc",
                        "duration": "2019-Present",
                        "description": "Developing software"
                    }
                ],
                "projects": [
                    {
                        "name": "Project X",
                        "description": "A cool project"
                    }
                ],
                "skills": ["JavaScript", "Python"],
                "certifications": [],
                "achievements": []
            },
            "isScannedDocument": False
        }
    }
    
    # Convert test data to JSON string
    test_data_json = json.dumps(test_data)
    
    # Print test configuration
    print(f"Python executable: {python_exec}")
    print(f"Wrapper script: {wrapper_script}")
    print(f"Test data: {test_data_json}")
    
    # Import subprocess in the function to avoid interfering with the wrapper's imports
    import subprocess
    
    # Run the wrapper script with the test data
    cmd = [
        python_exec,
        wrapper_script,
        "--function", "parse_enhanced_resume",
        "--data", test_data_json
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("STDOUT:")
        print(result.stdout)
        
        if result.stderr:
            print("STDERR:")
            print(result.stderr)
            
        # Try to parse the output as JSON
        try:
            json_result = json.loads(result.stdout)
            print("Parsed JSON result:")
            print(json.dumps(json_result, indent=2))
        except json.JSONDecodeError:
            print("Could not parse output as JSON")
            
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        print("STDOUT:")
        print(e.stdout)
        print("STDERR:")
        print(e.stderr)

if __name__ == "__main__":
    main() 