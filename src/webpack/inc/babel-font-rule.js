const directories = require("../utils/directories");
const _ = require("lodash");

const defaultOptions = {
  outputPath: "fonts/",
  name: "[hash].[ext]",
  context: directories.src,
};

module.exports = module.exports.default = (options) => ({
  test: /\.(eot|ttf|woff|woff2)$/,
  use: [
    {
      loader: "file-loader",
      options: _.assignIn({}, defaultOptions, options)
    },
  ]
});