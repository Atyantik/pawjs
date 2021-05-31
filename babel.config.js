const babelServerRule = require('./src/webpack/inc/babel-server-rule')({
  cacheDirectory: false,
  noChunk: true,
}).use.options;

module.exports = {
  presets: babelServerRule.presets,
  plugins: babelServerRule.plugins,
};