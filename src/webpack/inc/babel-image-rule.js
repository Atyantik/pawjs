const directories = require("../utils/directories");
const _ = require("lodash");

const defaultOptions = {
  outputPath: "images/",
  name: "[hash].[ext]",
  context: directories.src,
};

module.exports = module.exports.default = (options) => ({
  test: /\.(jpe?g|png|gif|svg|webp)$/i,
  use: [
    {
      loader: "file-loader",
      options: _.assignIn({}, defaultOptions, options)
    },
  ]
});