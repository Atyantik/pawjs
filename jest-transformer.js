const { transformSync } = require('@babel/core');
const supportedExtensions = require('./src/extensions');
/**
 * As this is a mixture of ES6 and ES5 we require module that might
 * be exported as default or using the old module.exports
 * @param m array | object | any
 * @returns {*}
 */
global.getDefault = global.getDefault || (m => (m.default ? m.default : m));

/**
 * We need to resolve the files as per the extensions at many places
 * for example we do not want to restrict people to just .js or .jsx extension
 * we need ability like fileExistsSync to compare for all extensions we have defined
 * in `src/extensions`
 * @type {*|Function}
 */
global.pawExistsSync = global.pawExistsSync || ((filePath, fileSystem = fs) => {
  if (fileSystem.existsSync(filePath)) return filePath;
  let resolvedFilePath = '';
  supportedExtensions.javascript.forEach((jsExt) => {
    if (resolvedFilePath) {
      return;
    }
    if (fileSystem.existsSync(filePath + jsExt)) {
      resolvedFilePath = filePath + jsExt;
    }
  });
  return resolvedFilePath;
});

// eslint-disable-next-line no-unused-vars
/* global pawDebug */
global.pawDebug = global.pawDebug || ((data, options = {}) => {
  // eslint-disable-next-line
  console.log(util.inspect(data, { depth: 10, ...options }));
});
const babelServerRule = require('./src/webpack/inc/babel-server-rule')({
  cacheDirectory: false,
  noChunk: true,
}).use.options;

module.exports = {
  process(fileContent) {
    const result = transformSync(fileContent, {
      filename: 'test.js',
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
      plugins: babelServerRule.plugins,
    });
    return result.code;
  },
};
