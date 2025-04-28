#!/usr/bin/env python3
"""
Enhancer Wrapper

This script serves as a wrapper for the enhancer.py module, facilitating
communication between Node.js and Python.

It accepts command-line arguments, executes the requested function,
and returns the result in JSON format.
"""

import argparse
import json
import sys
import traceback
from pathlib import Path
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("enhancer_wrapper")

# Add the parent directory to the path so we can import the enhancer module
parent_dir = str(Path(__file__).parent)
sys.path.append(parent_dir)

logger.info(f"Python version: {sys.version}")
logger.info(f"Working directory: {os.getcwd()}")
logger.info(f"Module search path: {sys.path}")

# Import the enhancer module
try:
    logger.info("Attempting to import enhancer module...")
    import enhancer
    logger.info("Successfully imported enhancer module")
except ImportError as e:
    error_msg = f"Failed to import enhancer module: {str(e)}"
    logger.error(error_msg)
    print(json.dumps({"error": error_msg}))
    sys.exit(1)

def main():
    """Main entry point for the wrapper script."""
    parser = argparse.ArgumentParser(description="Python enhancer wrapper for Node.js")
    parser.add_argument("--function", required=True, help="Function to execute")
    parser.add_argument("--data", required=True, help="JSON-encoded data for the function")
    
    try:
        args = parser.parse_args()
        function_name = args.function
        logger.info(f"Called with function: {function_name}")
        
        try:
            data = json.loads(args.data)
            logger.info(f"Received data with keys: {list(data.keys())}")
        except json.JSONDecodeError as e:
            error_msg = f"Invalid JSON data: {str(e)}"
            logger.error(error_msg)
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        # Map function names to actual functions
        function_map = {
            "parse_enhanced_resume": enhancer.parse_enhanced_resume,
            "render_latex": enhancer.render_latex,
            "match_jobs": enhancer.match_jobs,
            "generate_learning_path": enhancer.generate_learning_path,
            "generate_cover_letter": enhancer.generate_cover_letter
        }
        
        # Check if the requested function exists
        if function_name not in function_map:
            available_functions = ", ".join(function_map.keys())
            error_msg = f"Function '{function_name}' not found. Available functions: {available_functions}"
            logger.error(error_msg)
            print(json.dumps({"error": error_msg}))
            sys.exit(1)
        
        logger.info(f"Executing function: {function_name}")
        
        # Execute the function
        try:
            result = function_map[function_name](data)
            logger.info(f"Function execution completed")
        except Exception as e:
            error_msg = f"Error executing function '{function_name}': {str(e)}"
            logger.error(error_msg)
            logger.error(traceback.format_exc())
            print(json.dumps({
                "error": error_msg,
                "traceback": traceback.format_exc()
            }))
            sys.exit(1)
        
        # Handle different result types
        try:
            if isinstance(result, str):
                # If the result is a string, assume it's either JSON or plain text
                try:
                    # Try to parse as JSON first
                    parsed_result = json.loads(result)
                    logger.info("Result is a JSON string, returning parsed JSON")
                    print(json.dumps(parsed_result))
                except json.JSONDecodeError:
                    # If not valid JSON, return as text
                    logger.info("Result is a plain text string, wrapping in text field")
                    print(json.dumps({"text": result}))
            else:
                # If already a dict or other JSON-serializable object
                logger.info(f"Result is a {type(result).__name__}, returning as JSON")
                print(json.dumps(result))
        except Exception as e:
            error_msg = f"Error formatting result: {str(e)}"
            logger.error(error_msg)
            print(json.dumps({
                "error": error_msg,
                "traceback": traceback.format_exc()
            }))
            sys.exit(1)
            
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        logger.error(error_msg)
        logger.error(traceback.format_exc())
        print(json.dumps({
            "error": error_msg,
            "traceback": traceback.format_exc()
        }))
        sys.exit(1)

if __name__ == "__main__":
    main() 