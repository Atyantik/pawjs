module.exports = module.exports.default =  (options = {noChunk: false}) => [
  require("../plugins/react-loadable-routes"),
  options.noChunk ? require("../plugins/dynamic-import-webpack"): require("@babel/plugin-syntax-dynamic-import"),
  // require("@babel/plugin-syntax-dynamic-import"),
  require("@babel/plugin-proposal-object-rest-spread"),
  [
    require("@babel/plugin-proposal-decorators"),
    {
      "legacy": true
    }
  ],
  [
    require("@babel/plugin-proposal-class-properties"),
    {
      "loose": true
    }
  ],
  require("@babel/plugin-proposal-async-generator-functions"),
  require("babel-plugin-lodash")
];
