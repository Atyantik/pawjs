let reactLoadableRoutes = require("../plugins/react-loadable-routes");
reactLoadableRoutes = reactLoadableRoutes.default ? reactLoadableRoutes.default : reactLoadableRoutes;

let dynamicImportWebpack = require("../plugins/dynamic-import-webpack");
dynamicImportWebpack = dynamicImportWebpack.default ? dynamicImportWebpack.default: dynamicImportWebpack;

let syntaxDynamicImport = require("@babel/plugin-syntax-dynamic-import");
syntaxDynamicImport = syntaxDynamicImport.default ? syntaxDynamicImport.default: syntaxDynamicImport;

let objectRestSpread = require("@babel/plugin-proposal-object-rest-spread");
objectRestSpread = objectRestSpread.default ? objectRestSpread.default: objectRestSpread;

let decorators = require("@babel/plugin-proposal-decorators");
decorators = decorators.default ? decorators.default: decorators;

let classProperties = require("@babel/plugin-proposal-class-properties");
classProperties = classProperties.default ? classProperties.default: classProperties;

let generatorFunctions = require("@babel/plugin-proposal-async-generator-functions");
generatorFunctions = generatorFunctions.default? generatorFunctions.default : generatorFunctions;

let lodash = require("babel-plugin-lodash");
lodash = lodash.default ? lodash.default: lodash;

let reactHotLoader = require("react-hot-loader/babel");
reactHotLoader = reactHotLoader.default? reactHotLoader.default: reactHotLoader;

const defaults = {noChunk: false, hot: true};
module.exports = module.exports.default =  (options = {noChunk: false, hot: true}) => {
  options = Object.assign({}, defaults, options);
  return [
    reactLoadableRoutes,
    options.noChunk ? dynamicImportWebpack: syntaxDynamicImport,
    objectRestSpread,
    [
      decorators,
      {
        "legacy": true
      }
    ],
    [
      classProperties,
      {
        "loose": true
      }
    ],
    generatorFunctions,
    lodash,
    ...(options.hot ? [reactHotLoader]: []),
  ];
};
