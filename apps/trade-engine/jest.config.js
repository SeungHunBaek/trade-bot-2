module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@passive-money/config$': '<rootDir>/../../packages/config/dist',
    '^@passive-money/common$': '<rootDir>/../../packages/common/dist',
    '^@passive-money/database$': '<rootDir>/../../packages/database/dist',
    '^@passive-money/exchange$': '<rootDir>/../../packages/exchange/dist',
  },
};
