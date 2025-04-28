# Minimal Python Bridge Implementation

This directory contains a minimal implementation of the Python Bridge used for resume enhancement in the RACE application.

## Files

- `minimal-bridge.js`: A simplified implementation of the Python Bridge that provides basic functionality without requiring Python or external dependencies.
- `test-bridge.js`: A test script that demonstrates how to use the minimal bridge.
- `test-controller.js`: A mock test structure for testing the resumeController with the minimal bridge.

## Functionality

The minimal bridge provides the following functions:

- `enhanceResume`: Enhances a resume data object by adding `enhanced: true` and `enhancedDate` properties.
- `resolveTemplatePath`: Resolves the path to template files.
- `verifyTemplates`: Verifies that required templates exist.
- `getPerformanceMetrics`: Returns performance metrics (simplified).

## Usage

To use the minimal bridge:

```javascript
const { enhanceResume } = require('./minimal-bridge');

// Call the function with resume data
const enhancedResume = await enhanceResume(resumeData);
```

## Integration with Controllers

The `resumeController.js` file has been modified to gracefully fall back to the minimal bridge implementation if the main Python bridge fails to load:

```javascript
let pythonEnhanceResume, generateLatex;

try {
  // Try to import from the main pythonBridge first
  const pythonBridge = require('../utils/pythonBridge');
  pythonEnhanceResume = pythonBridge.enhanceResume;
  generateLatex = pythonBridge.generateLatex;
  console.log('Using main Python bridge implementation');
} catch (error) {
  // Fall back to minimal bridge if main bridge fails
  console.log('Main Python bridge failed to load, using minimal implementation');
  const minimalBridge = require('../utils/minimal-bridge');
  pythonEnhanceResume = minimalBridge.enhanceResume;
  generateLatex = () => Promise.resolve('\\documentclass{article}\\begin{document}Minimal LaTeX implementation\\end{document}');
}
```

## Testing

To test the minimal bridge implementation:

```bash
node test-bridge.js
``` 