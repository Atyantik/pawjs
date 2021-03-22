const fs = require('fs');
const util = require('util');

/**
 * As this is a mixture of ES6 and ES5 we require module that might
 * be exported as default or using the old module.exports
 * @param m array | object | any
 * @returns {*}
 */
const getDefault = ((m) => (m.default ? m.default : m));
const supportedExtensions = getDefault(require('./extensions'));

/**
 * We need to resolve the files as per the extensions at many places
 * for example we do not want to restrict people to just .js or .jsx extension
 * we need ability like fileExistsSync to compare for all extensions we have defined
 * in `src/extensions`
 * @type {*|Function}
 */
const pawExistsSync = ((filePath, fileSystem = fs) => {
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

const pawDebug = ((data, options = {}) => {
  // eslint-disable-next-line no-console
  console.log(util.inspect(data, { depth: 10, ...options }));
});

module.exports.getDefault = getDefault;
module.exports.pawExistsSync = pawExistsSync;
module.exports.pawDebug = pawDebug;
module.exports = {
  getDefault,
  pawExistsSync,
  pawDebug,
};
