#!/usr/bin/env node

/**
 * Script to start the development server for RACE Resume App
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('\n🚀 Starting RACE Resume App development server...\n');

// Start the development server
const nodemon = spawn('npx', ['nodemon', 'index.js'], {
  stdio: 'inherit',
  shell: true
});

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  nodemon.kill();
  process.exit(0);
});

// Forward the exit code
nodemon.on('close', (code) => {
  console.log(`\n⚠️ Server process exited with code ${code}`);
  process.exit(code);
}); 