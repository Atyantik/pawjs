let babelServerJSRule = require('./babel-server-rule-js');

babelServerJSRule = babelServerJSRule.default ? babelServerJSRule.default : babelServerJSRule;

let babelServerTSRule = require('./babel-server-rule-ts');

babelServerTSRule = babelServerTSRule.default ? babelServerTSRule.default : babelServerTSRule;

const rule = options => [
  babelServerJSRule(options),
  babelServerTSRule(options),
];

module.exports = rule;
