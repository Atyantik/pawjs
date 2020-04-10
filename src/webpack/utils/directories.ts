/* global getDefault */
/* global pawExistsSync */
import path from 'path';

interface IDirectories {
  root: string;
  src: string;
  dist: string;
  build: string;
}

const projectRoot = path.normalize(path.join(__dirname, '..', '..', '..'));
let directories: IDirectories = {
  ...{
    root: path.resolve(projectRoot, 'demo'),
    src: path.resolve(projectRoot, 'demo', 'src'),
    dist: path.join(projectRoot, 'demo', 'dist'),
    build: path.join(projectRoot, 'demo', 'dist', 'build'),
  },
};
if (typeof process.env.PROJECT_ROOT !== 'undefined') {
  /**
   * Default directory list
   * @type {{root: string, src: string, dist: string, build: string}}
   */
  directories = {
    root: process.env.PROJECT_ROOT,
    src: path.resolve(process.env.PROJECT_ROOT, 'src'),
    dist: path.join(process.env.PROJECT_ROOT, 'dist'),
    build: path.join(process.env.PROJECT_ROOT, 'dist', 'build'),
  };

  try {
    const directoriesConfigPath = pawExistsSync(`${process.env.PROJECT_ROOT}/directories`);
    if (directoriesConfigPath) {
      directories = {
        ...directories,
        // eslint-disable-next-line
        ...getDefault(require(directoriesConfigPath)),
      };
    }
  } catch (ex) {
    // do nothing
  }
}

export default { ...directories };
