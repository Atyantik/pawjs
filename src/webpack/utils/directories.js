const path = require('path');
const fs = require('fs');
const defaultsDeep = require('lodash/defaultsDeep');

/**
 * Default directory list
 * @type {{root: *, src: *, dist: *, build: *}}
 */
const defaultDirectories = {
  root: process.env.PROJECT_ROOT,
  src: path.resolve(process.env.PROJECT_ROOT, 'src'),
  dist: path.join(process.env.PROJECT_ROOT, 'dist'),
  build: path.join(process.env.PROJECT_ROOT, 'dist', 'build'),
};

let directories = {};
try {
  const directoriesConfigPath = `${process.env.PROJECT_ROOT}/directories.js`;
  if (fs.existsSync(directoriesConfigPath)) {
    // eslint-disable-next-line
    directories = require(directoriesConfigPath);
  }
} catch (ex) {
  // reset directories to blank object
  directories = {};
}

directories = defaultsDeep(directories, defaultDirectories);

module.exports = Object.assign({}, directories);
