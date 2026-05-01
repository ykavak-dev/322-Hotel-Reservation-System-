/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^.*generated/prisma$': '<rootDir>/generated/prisma',
  },
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/routes/**/*.ts',
    'src/middleware/**/*.ts',
    '!src/server.ts',
    '!src/types/**/*.ts',
  ],
  coverageThreshold: {
    global: { branches: 30, functions: 40, lines: 40, statements: 40 },
  },
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
  },
};
