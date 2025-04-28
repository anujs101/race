/**
 * Python Dependencies Checker
 * 
 * This script checks if Python is installed and verifies the required Python
 * dependencies for the resume enhancement features.
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// List of required Python dependencies
const REQUIRED_PACKAGES = [
  'jinja2',        // For templating LaTeX documents
  'pdflatex',      // For converting LaTeX to PDF
  'faiss-cpu',     // For vector search operations
  'sentence-transformers', // For embedding generation
  'groq',          // API client for Groq LLM
  'regex',         // For pattern matching
  're',            // Core regex module
  'json',          // JSON handling
  'sys',           // System operations
  'argparse'       // Command line argument parsing
];

// Path to Python requirements file
const REQUIREMENTS_FILE = path.resolve(__dirname, '../../py_models/requirements.txt');

/**
 * Check if Python is installed
 * @returns {Promise<boolean>} True if Python is installed, false otherwise
 */
const checkPythonInstalled = () => {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python3', ['--version']);
    
    pythonProcess.on('close', (code) => {
      resolve(code === 0);
    });
    
    pythonProcess.on('error', () => {
      resolve(false);
    });
  });
};

/**
 * Create a requirements.txt file if it doesn't exist
 * @returns {Promise<void>}
 */
const createRequirementsFile = async () => {
  // Check if requirements.txt already exists
  try {
    await fs.promises.access(REQUIREMENTS_FILE, fs.constants.F_OK);
    console.log('Requirements file already exists.');
    return;
  } catch (error) {
    // File doesn't exist, create it
    const requirementsContent = REQUIRED_PACKAGES.join('\n');
    
    try {
      // Ensure directory exists
      const dir = path.dirname(REQUIREMENTS_FILE);
      await fs.promises.mkdir(dir, { recursive: true });
      
      // Write file
      await fs.promises.writeFile(REQUIREMENTS_FILE, requirementsContent);
      console.log('Created requirements.txt file.');
    } catch (error) {
      console.error('Failed to create requirements.txt file:', error.message);
      throw error;
    }
  }
};

/**
 * Install Python dependencies
 * @returns {Promise<void>}
 */
const installDependencies = () => {
  return new Promise((resolve, reject) => {
    console.log('Installing Python dependencies...');
    
    const pipProcess = spawn('pip3', ['install', '-r', REQUIREMENTS_FILE]);
    
    pipProcess.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    
    pipProcess.stderr.on('data', (data) => {
      console.error(data.toString());
    });
    
    pipProcess.on('close', (code) => {
      if (code === 0) {
        console.log('Python dependencies installed successfully.');
        resolve();
      } else {
        reject(new Error(`pip install failed with code ${code}`));
      }
    });
    
    pipProcess.on('error', (error) => {
      reject(new Error(`Failed to start pip: ${error.message}`));
    });
  });
};

/**
 * Main function
 */
const main = async () => {
  try {
    // Check if Python is installed
    const isPythonInstalled = await checkPythonInstalled();
    
    if (!isPythonInstalled) {
      console.error('Python is not installed. Please install Python 3.6 or later.');
      process.exit(1);
    }
    
    console.log('Python is installed.');
    
    // Create requirements.txt file if needed
    await createRequirementsFile();
    
    // Ask user if they want to install dependencies
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('Do you want to install Python dependencies? (y/n): ', async (answer) => {
      readline.close();
      
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        try {
          await installDependencies();
          console.log('Setup completed successfully.');
        } catch (error) {
          console.error('Error installing dependencies:', error.message);
          process.exit(1);
        }
      } else {
        console.log('Skipping dependency installation.');
        console.log('Note: The resume enhancement features may not work without the required dependencies.');
      }
    });
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Run the main function
main(); 