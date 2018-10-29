const directories = require('../utils/directories');

module.exports = function prefetchLoader(source) {
  if (this.resourcePath.indexOf(directories.src) !== -1) {
    return source.replace(/import\([^/\\*](.*)("|')\)/g, 'import(/* webpackPrefetch: true */"$1")');
  }
  return source;
};
