const path = require("path");
const fs = require("fs");

/**
 * Default directory list
 * @type {{root: *, src: *, dist: *, build: *}}
 */
const defaultDirectories = {
  root: process.env.__project_root,
  src: path.resolve(process.env.__project_root, "src"),
  dist: path.join(process.env.__project_root, "dist"),
  build: path.join(process.env.__project_root, "dist", "build"),
};

const defaultsDeep = require("lodash/defaultsDeep");

let directories = {};
try {
  const directoriesConfigPath = `${process.env.__project_root}/directories.js`;
  if (fs.existsSync(directoriesConfigPath)) {
    directories = require(directoriesConfigPath);
  }
} catch (ex) {
  // reset directories to blank object
  directories = {};
}

directories = defaultsDeep(directories, defaultDirectories);

module.exports = Object.assign({}, directories);