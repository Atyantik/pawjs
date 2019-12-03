const javascriptExtensions = [
  '.mjs',
  '.mjsx',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
];
const javascriptExtensionRegExp = /\.(mj|j|t)sx?$/;

// Including web assembly
const resolveExtensions = ['.wasm']
  .concat(javascriptExtensions.slice(0))
  .concat(['.json']);

module.exports.javascript = javascriptExtensions.slice(0);
module.exports.javascriptRegExp = javascriptExtensionRegExp;
module.exports.resolveExtensions = resolveExtensions.slice(0);
module.exports = {
  javascript: javascriptExtensions.slice(0),
  javascriptRegExp: javascriptExtensionRegExp,
  resolveExtensions: resolveExtensions.slice(0),
};
