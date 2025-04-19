/**
 * Test script for the resume formatter utility
 */
const { flatten_resume_json } = require('./utils/resumeFormatter');

// Test cases
const testCases = [
  {
    name: "Standard Case",
    data: {
      data: {
        resumeId: "test123",
        classification: {
          contactInfo: {
            name: "John Doe",
            email: "john.doe@example.com",
            phone: "123-456-7890",
            address: "New York, NY",
            linkedin: "linkedin.com/in/johndoe"
          },
          education: [
            "Harvard University (2015-2019), Bachelor of Science in Computer Science"
          ],
          experience: [
            {
              role: "Software Engineer",
              organization: "Tech Company",
              duration: "2019-2023",
              description: "Developed and maintained web applications using React and Node.js."
            },
            {
              role: "Intern",
              organization: "Startup Inc",
              duration: "Summer 2018",
              description: "Assisted in developing mobile applications using Flutter."
            }
          ],
          projects: [
            {
              name: "E-commerce Platform",
              description: "Built a full-stack e-commerce platform with user authentication and payment processing."
            }
          ],
          skills: [
            "JavaScript", "React", "Node.js", "MongoDB", "Flutter", "Git"
          ],
          certifications: [
            "AWS Certified Developer",
            "React Developer Certification"
          ],
          achievements: [
            "Winner of College Hackathon 2018",
            "Dean's List 2016-2019"
          ]
        },
        isScannedDocument: false
      }
    }
  },
  {
    name: "Minimal Data",
    data: {
      data: {
        resumeId: "minimal123",
        classification: {
          contactInfo: {
            name: "Jane Smith"
          },
          education: [],
          experience: [],
          projects: [],
          skills: ["JavaScript"],
          certifications: [],
          achievements: []
        },
        isScannedDocument: false
      }
    }
  },
  {
    name: "String Experience (instead of object)",
    data: {
      data: {
        resumeId: "string123",
        classification: {
          contactInfo: {
            name: "Bob Johnson"
          },
          education: [],
          experience: ["Software Engineer at ABC Corp (2020-2023)"],
          projects: ["Personal Website"],
          skills: [],
          certifications: [],
          achievements: []
        },
        isScannedDocument: false
      }
    }
  },
  {
    name: "Missing Classification",
    data: {
      data: {
        resumeId: "missing123"
      }
    }
  },
  {
    name: "Null Input",
    data: null
  }
];

// Run tests
console.log("Testing resume formatter...\n");

testCases.forEach((testCase, index) => {
  console.log(`\n---- Test Case ${index + 1}: ${testCase.name} ----`);
  try {
    const result = flatten_resume_json(testCase.data);
    console.log(result);
  } catch (error) {
    console.error(`Error in test case ${index + 1}:`, error);
  }
  console.log("------------------------------------");
});

console.log("\nAll tests completed!"); 