module.exports = {
  name: 'pawjs',
  verbose: false,
  silent: false,
  cache: false,
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
  ]
};
