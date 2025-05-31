// Global test setup
process.env.NODE_ENV = 'test';

// Increase timeout for tests that interact with AWS
jest.setTimeout(30000);

// Mock console methods to reduce test noise
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
  // Optionally silence console output during tests
  // console.log = jest.fn();
  // console.error = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
