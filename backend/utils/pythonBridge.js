/**
 * Python Bridge - Utility for executing Python scripts from Node.js
 * Handles communication between Node.js and Python via child processes
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Execute a Python script with JSON input and receive JSON output
 * @param {string} scriptPath - Path to the Python script to execute
 * @param {Object} params - Parameters to pass to the Python script as JSON
 * @param {number} timeout - Timeout in milliseconds (default: 30000ms)
 * @returns {Promise<Object>} - JSON response from the Python script
 */
const executePythonScript = async (scriptPath, params, timeout = 30000) => {
  return new Promise((resolve, reject) => {
    // Check if script exists
    if (!fs.existsSync(scriptPath)) {
      return reject(new Error(`Python script not found: ${scriptPath}`));
    }

    // Find the Python executable (check virtual env first, then env var, then system python)
    const projectRoot = path.resolve(__dirname, '../..');
    const venvPaths = [
      path.join(projectRoot, '.venv/bin/python'),
      path.join(projectRoot, 'venv/bin/python'),
      path.join(projectRoot, '.venv/Scripts/python.exe'),
      path.join(projectRoot, 'venv/Scripts/python.exe')
    ];
    
    let pythonExecutable = process.env.PYTHON_PATH || 'python3';
    
    // Check if any of the virtual environment paths exist
    for (const venvPath of venvPaths) {
      if (fs.existsSync(venvPath)) {
        pythonExecutable = venvPath;
        break;
      }
    }

    console.log(`Using Python executable: ${pythonExecutable}`);
    console.log(`Running script: ${scriptPath}`);

    // Sanitize parameters
    let paramsString;
    try {
      paramsString = JSON.stringify(params || {});
    } catch (error) {
      return reject(new Error(`Failed to stringify parameters: ${error.message}`));
    }

    // Track if the promise has been resolved/rejected
    let isResolved = false;

    // Spawn Python process
    const pythonProcess = spawn(pythonExecutable, [
      scriptPath,
      paramsString
    ]);

    // Variables to collect stdout and stderr
    let stdoutData = '';
    let stderrData = '';

    // Collect stdout data
    pythonProcess.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    // Collect stderr data
    pythonProcess.stderr.on('data', (data) => {
      stderrData += data.toString();
      console.error(`Python stderr: ${data}`);
    });

    // Helper function to safely parse JSON
    const safeJsonParse = (jsonString) => {
      try {
        // Remove any BOM, control characters, or non-JSON text
        const sanitized = jsonString.trim().replace(/^\uFEFF/, '');
        
        // Find the first { or [ character
        const startIdx = sanitized.search(/[\{\[]/);
        
        if (startIdx === -1) {
          throw new Error('No valid JSON object or array found');
        }
        
        // Find the matching closing bracket/brace
        let endIdx = -1;
        let openCount = 0;
        let inString = false;
        let escaped = false;
        
        for (let i = startIdx; i < sanitized.length; i++) {
          const char = sanitized[i];
          
          if (inString) {
            if (char === '\\' && !escaped) {
              escaped = true;
            } else if (char === '"' && !escaped) {
              inString = false;
            } else {
              escaped = false;
            }
          } else if (char === '"') {
            inString = true;
          } else if (char === '{' || char === '[') {
            openCount++;
          } else if (char === '}' || char === ']') {
            openCount--;
            if (openCount === 0) {
              endIdx = i + 1;
              break;
            }
          }
        }
        
        if (endIdx === -1) {
          throw new Error('Unclosed JSON object or array');
        }
        
        // Extract the JSON substring
        const jsonSubstring = sanitized.substring(startIdx, endIdx);
        return JSON.parse(jsonSubstring);
      } catch (error) {
        throw new Error(`JSON parse error: ${error.message}`);
      }
    };

    // Handle process completion
    pythonProcess.on('close', (code) => {
      if (isResolved) return;

      if (code !== 0) {
        // Check if stderr is empty but stdout contains error information
        if (!stderrData.trim() && stdoutData.trim()) {
          try {
            // Try to parse stdout as JSON, it might contain error information
            const output = safeJsonParse(stdoutData);
            if (output && output.error) {
              isResolved = true;
              return reject(new Error(`Python process error: ${output.error}`));
            }
          } catch (e) {
            // If parse fails, stdout is not a valid JSON error response
            console.error('Failed to parse error output:', e.message);
          }
        }
        isResolved = true;
        return reject(new Error(`Python process exited with code ${code}: ${stderrData.trim() || 'No error details available'}`));
      }

      // Process exited successfully, try to parse JSON response
      if (!stdoutData.trim()) {
        isResolved = true;
        return reject(new Error('Python script returned empty output'));
      }
      
      try {
        const result = safeJsonParse(stdoutData);
        isResolved = true;
        resolve(result);
      } catch (error) {
        console.error('Failed to parse Python output as JSON:', error.message);
        console.error('Raw output:', stdoutData);
        isResolved = true;
        reject(new Error(`Failed to parse Python output as JSON: ${error.message}. Raw output: ${stdoutData.slice(0, 200)}${stdoutData.length > 200 ? '...' : ''}`));
      }
    });

    // Handle process errors
    pythonProcess.on('error', (error) => {
      if (isResolved) return;
      isResolved = true;
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (isResolved) return;
      
      // Try to kill the process
      try {
        pythonProcess.kill('SIGTERM');
      } catch (e) {
        console.error('Failed to kill Python process:', e);
      }
      
      isResolved = true;
      reject(new Error(`Python script execution timed out after ${timeout}ms`));
    }, timeout);

    // Clear timeout when process exits
    pythonProcess.on('exit', () => {
      clearTimeout(timeoutId);
    });
  });
};

module.exports = {
  executePythonScript
}; 