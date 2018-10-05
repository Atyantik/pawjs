module.exports = function prefetchLoader(source) {
  return source.replace(/import\([^/\\*](.*)("|')\)/g, 'import(/* webpackPrefetch: true */"$1")');
};
