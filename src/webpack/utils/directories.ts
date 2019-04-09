import path from 'path';
import defaultsDeep from 'lodash/defaultsDeep';

/* global getDefault */

interface IDirectories {
  root?: string;
  src?: string;
  dist?: string;
  build?: string;
}

const projectRoot = path.resolve(path.join(__dirname, '..', '..', '..'));
let defaultDirectories = {
  root: path.resolve(projectRoot, 'demo'),
  src: path.resolve(projectRoot, 'demo', 'src'),
  dist: path.join(projectRoot, 'demo', 'dist'),
  build: path.join(projectRoot, 'demo', 'dist', 'build'),
};
let directories: IDirectories = {};
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
    const directoriesConfigPath = `${process.env.PROJECT_ROOT}/directories`;
    if (path.resolve(directoriesConfigPath)) {
      // @ts-ignore
      directories = getDefault(require(directoriesConfigPath)); // eslint-disable-line
    }
  } catch (ex) {
    // reset directories to blank object
    directories = {};
  }

  directories = defaultsDeep(directories, defaultDirectories);
}

export default Object.assign({}, directories);
