module.exports = function(source) {
  return source.replace(/import\([^/\\*](.*)("|')\)/g, "import(/* webpackPrefetch: true */\"$1\")");
};