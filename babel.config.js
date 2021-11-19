const babelServerRule = require('./src/webpack/inc/babel-server-rule')().use.options;

module.exports = {
  presets: babelServerRule.presets,
  plugins: babelServerRule.plugins,
};
