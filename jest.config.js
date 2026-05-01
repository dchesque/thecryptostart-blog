const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  // Default to node — most lib tests don't need DOM. Per-file override
  // available via `@jest-environment jsdom` docblock.
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/mcp-server/'],
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/mcp-server/'],
}

module.exports = createJestConfig(customJestConfig)
