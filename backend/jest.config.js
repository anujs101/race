module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: '__tests__/coverage',
  verbose: true,
  setupFilesAfterEnv: ['./test.setup.js'],
  testTimeout: 30000
}; 