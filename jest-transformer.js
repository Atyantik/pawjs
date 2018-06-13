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
module.exports = customJest;