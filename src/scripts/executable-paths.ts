import * as fs from 'fs';
import * as path from 'path';
import uniq from 'lodash/uniq';

const pRoot = process.env.PROJECT_ROOT || (process.cwd() + path.sep);
const lRoot = process.env.LIB_ROOT || path.resolve(__dirname, '../');
const processDir: string = path.resolve(process.cwd());

const addToArrayIfExists = (arr: string [], paths: string []): void => {
  const joinedPath = path.join(...paths);
  if (fs.existsSync(joinedPath)) {
    arr.unshift(joinedPath);
  }
};

/**
 * @param projectRoot
 * @param libRoot
 */
export default (projectRoot: string = pRoot, libRoot: string = lRoot): string [] => {
  let executablePaths = process.env.PATH ? process.env.PATH.split(path.delimiter) : [];

  const absoluteProjectRoot = !path.isAbsolute(projectRoot)
    ? path.resolve(processDir, projectRoot)
    : path.resolve(projectRoot);
  const absoluteLibRoot = !path.isAbsolute(libRoot)
    ? path.resolve(processDir, libRoot)
    : path.resolve(libRoot);
  // Add library root to executable path without the trailing slash,
  // Ideally path.resolve should remove the trailing slash, but we added
  // the extra piece of code for just in case as precaution, we can remove it in future

  // Include library's bin and it's node_modules's bin
  addToArrayIfExists(executablePaths, [absoluteLibRoot]);
  addToArrayIfExists(executablePaths, [absoluteLibRoot, '.bin']);
  addToArrayIfExists(executablePaths, [absoluteLibRoot, 'node_modules']);
  addToArrayIfExists(executablePaths, [absoluteLibRoot, 'node_modules', '.bin']);

  // If PawJS is added as dependency of the current project via
  // package.json then the below path is added to path automatically
  // but if just in case if pawjs is added dependency of dependency
  // then we want to include the parent node_modules and bin of parent
  // if it exists.
  // Add parent directory node_modules of pawjs to the list
  addToArrayIfExists(executablePaths, [absoluteLibRoot, '..', 'node_modules']);
  addToArrayIfExists(executablePaths, [absoluteLibRoot, '..', 'node_modules', '.bin']);

  // Include current folder bin and node_modules's bin
  addToArrayIfExists(executablePaths, [absoluteProjectRoot]);
  addToArrayIfExists(executablePaths, [absoluteProjectRoot, '.bin']);
  addToArrayIfExists(executablePaths, [absoluteProjectRoot, 'node_modules']);
  addToArrayIfExists(executablePaths, [absoluteProjectRoot, 'node_modules', '.bin']);

  // If library root is current directory, i.e. we are developing pawjs,
  // then include the node_modules from packages as well.
  if (lRoot === process.cwd()) {
    const packages = fs.readdirSync(path.join(absoluteLibRoot, 'packages'));
    packages.forEach((p) => {
      const packagePath = path.join(absoluteLibRoot, 'packages', p);
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
