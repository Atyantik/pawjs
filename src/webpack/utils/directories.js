const path = require('path');
const fs = require('fs');
const defaultsDeep = require('lodash/defaultsDeep');

const projectRoot = path.resolve(path.join(__dirname, '..', '..', '..'));
let defaultDirectories = {
  root: path.resolve(projectRoot, 'demo'),
  src: path.resolve(projectRoot, 'demo', 'src'),
  dist: path.join(projectRoot, 'demo', 'dist'),
  build: path.join(projectRoot, 'demo', 'dist', 'build'),
};
let directories = {};
if (typeof process.env.PROJECT_ROOT !== 'undefined') {
  /**
   * Default directory list
   * @type {{root: *, src: *, dist: *, build: *}}
   */
  defaultDirectories = {
    root: process.env.PROJECT_ROOT,
    src: path.resolve(process.env.PROJECT_ROOT, 'src'),
    dist: path.join(process.env.PROJECT_ROOT, 'dist'),
    build: path.join(process.env.PROJECT_ROOT, 'dist', 'build'),
  };

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
}
module.exports = Object.assign({}, directories);
