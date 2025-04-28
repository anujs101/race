const { enhanceResume } = require('./minimal-bridge');

// Sample resume data
const sampleResumeData = {
  basics: {
    name: "John Doe",
    label: "Software Developer",
    email: "john.doe@example.com",
    phone: "(123) 456-7890",
    summary: "Experienced software developer with 5 years of experience in web development."
  },
  work: [
    {
      company: "Tech Company",
      position: "Senior Developer",
      startDate: "2018-01-01",
      endDate: "2023-01-01",
      summary: "Led a team of developers building web applications.",
      highlights: [
        "Developed RESTful APIs",
        "Implemented CI/CD pipelines"
      ]
    }
  ],
  education: [
    {
      institution: "University of Technology",
      area: "Computer Science",
      studyType: "Bachelor",
      startDate: "2014-01-01",
      endDate: "2018-01-01"
    }
  ],
  skills: [
    {
      name: "JavaScript",
      level: "Expert"
    },
    {
      name: "Node.js",
      level: "Advanced"
    }
  ]
};

// Test the enhanceResume function
async function testEnhanceResume() {
  try {
    console.log('Testing enhanceResume function...');
    
    // Call the function with the sample data
    const enhancedResume = await enhanceResume(sampleResumeData);
    
    // Print the result
    console.log('Enhanced resume data:');
    console.log(JSON.stringify(enhancedResume, null, 2));
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testEnhanceResume(); 