const babelJest = require("babel-jest");
const babelServerRule = require("./src/webpack/inc/babel-server-rule")({
  cacheDirectory: false,
  noChunk: true,
}).use.options;

const customJest = babelJest.createTransformer({
  presets: babelServerRule.presets,
  plugins: babelServerRule.plugins
});
customJest.includes = (query) => {
  return query === "babel-jest";
};

module.exports = {
  "name": "pawjs",
  "verbose": true,
  "testEnvironment": "node",
  "collectCoverage": true,
  "coverageDirectory": "./coverage",
  "testPathIgnorePatterns": [
    "/node_modules/",
    "/__test_utils/",
    "__tests__/.*/fixtures/",
  ],
  "transform": {
    "^.+\\.jsx?$": "<rootDir>/jest-transformer.js"
  }
};