const babelJest = require('babel-jest');
const babelServerRule = require('./src/webpack/inc/babel-server-rule')({
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
  coverageDirectory: './coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
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
    '^.+\\.(j|t)sx?$': '<rootDir>/jest-transformer.js',
  },
};
