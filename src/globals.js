const fs = require('fs');
const util = require('util');
const supportedExtensions = require('./extensions');

/**
 * As this is a mixture of ES6 and ES5 we require module that might
 * be exported as default or using the old module.exports
 * @param m array | object | any
 * @returns {*}
 */
module.exports.getDefault = ((m) => (m.default ? m.default : m));

/**
 * We need to resolve the files as per the extensions at many places
 * for example we do not want to restrict people to just .js or .jsx extension
 * we need ability like fileExistsSync to compare for all extensions we have defined
 * in `src/extensions`
 * @type {*|Function}
 */
module.exports.pawExistsSync = ((filePath, fileSystem = fs) => {
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

module.exports.pawDebug = global.pawDebug || ((data, options = {}) => {
  // eslint-disable-next-line
  console.log(util.inspect(data, { depth: 10, ...options }));
});
