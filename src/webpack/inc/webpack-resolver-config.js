const path = require("path");
const directories = require("../utils/directories");

module.exports = module.exports.default = {
  resolve: {
    modules: [
      path.resolve(path.join(directories.root, "node_modules")),
      path.resolve(path.join(process.env.__lib_root, "node_modules")),
    ]
  },
  resolveLoader: {
    modules: [
      path.resolve(path.join(directories.root, "node_modules")),
      path.resolve(path.join(process.env.__lib_root, "node_modules")),
      path.resolve(path.join(process.env.__lib_root, "src", "webpack", "loaders"))
    ]
  }
};