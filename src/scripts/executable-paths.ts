import fs from 'fs';
import path from 'path';
import uniq from 'lodash/uniq';

const pRoot = process.env.PROJECT_ROOT || (process.cwd() + path.sep);
const lRoot = process.env.LIB_ROOT || path.resolve(__dirname, '../');

const addToArrayIfExists = (arr: string [], paths: string []): void => {
  const joinedPath = path.join(...paths);
  if (fs.existsSync(joinedPath)) {
    arr.unshift(joinedPath);
  }
};

export default (projectRoot: string = pRoot, libRoot: string = lRoot): string [] => {
  let executablePaths = process.env.PATH ? process.env.PATH.split(path.delimiter) : [];

  // Add library root to executable path without the trailing slash
  executablePaths.unshift(libRoot.replace(/\/$/, ''));

  // Include library's bin and it's node_modules's bin
  addToArrayIfExists(executablePaths, [libRoot, '.bin']);
  addToArrayIfExists(executablePaths, [libRoot, 'node_modules']);
  addToArrayIfExists(executablePaths, [libRoot, 'node_modules', '.bin']);

  // Add parent directory node_modules of pawjs to the list
  addToArrayIfExists(executablePaths, [libRoot, '..', 'node_modules']);

  // Add parent's parent directory node_modules of pawjs to the list
  addToArrayIfExists(executablePaths, [libRoot, '..', '..', 'node_modules']);

  // Add parent to parent directory
  // thus trying to add directory storing @pawjs/pawjs for resolution
  addToArrayIfExists(executablePaths, [libRoot, '..', '..', '..', 'node_modules']);
  addToArrayIfExists(executablePaths, [libRoot, '..', 'node_modules', '.bin']);

  // Add project root to executable path
  executablePaths.unshift(projectRoot.replace(/\/$/, ''));

  // Include current folder bin and node_modules's bin
  addToArrayIfExists(executablePaths, [projectRoot, '.bin']);
  addToArrayIfExists(executablePaths, [projectRoot, 'node_modules']);
  addToArrayIfExists(executablePaths, [projectRoot, 'node_modules', '.bin']);

  // If library root is current directory, i.e. we are developing pawjs,
  // then include the node_modules from packages as well.
  if (lRoot === process.cwd()) {
    const packages = fs.readdirSync(path.join(libRoot, 'packages'));
    packages.forEach((p) => {
      const packagePath = path.join(libRoot, 'packages', p);
      // Include package folder bin and node_modules's bin
      addToArrayIfExists(executablePaths, [packagePath, '.bin']);
      addToArrayIfExists(executablePaths, [packagePath, 'node_modules']);
      addToArrayIfExists(executablePaths, [packagePath, 'node_modules', '.bin']);
    });
  }
  // If there are duplicate entries clear them up
  executablePaths = uniq(executablePaths);
  return executablePaths;
};
