let babelWebJSRule = require('./babel-web-rule-js');

babelWebJSRule = babelWebJSRule.default ? babelWebJSRule.default : babelWebJSRule;

let babelWebTSRule = require('./babel-server-rule-ts');

babelWebTSRule = babelWebTSRule.default ? babelWebTSRule.default : babelWebTSRule;

const rule = options => [
  babelWebJSRule(options),
  babelWebTSRule(options),
];

module.exports = rule;
