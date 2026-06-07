/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { strict: false, esModuleInterop: true }
    }]
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
  verbose: true
};