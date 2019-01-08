const babelJest = require('babel-jest');
const babelServerRule = require('./src/webpack/inc/babel-server-rule-js')({
  cacheDirectory: false,
  noChunk: true,
}).use.options;

const customJest = babelJest.createTransformer({
  presets: babelServerRule.presets,
  plugins: babelServerRule.plugins,
});
customJest.includes = query => query === 'babel-jest';

module.exports = {
  name: 'pawjs',
  verbose: true,
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: './coverage',
  collectCoverageFrom: ['src/**/*.js'],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(ts|tsx|js|jsx|mjs)?$',
  testPathIgnorePatterns: [
    '/node_modules/',
    '/__test_utils/',
    '__tests__/.*/fixtures/',
  ],
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node',
  ],
  transform: {
    '^.+\\.jsx?$': '<rootDir>/jest-transformer.js',
    '^.+\\.tsx?$': 'ts-jest',
  },
};
