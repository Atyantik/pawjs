import path from 'path';
import fs from 'fs';
import each from 'lodash/each';

// Find command from all the paths possible
const findCommandPath = (com: string, pathList: string []): string => {
  let execPath = '';
  const possibleExtension = ['', '.exe', '.cmd', '.bat'];
  each(pathList, (executablePath) => {
    if (execPath.length) return;

    each(possibleExtension, (ext) => {
      if (execPath.length) return;

      const extendedPath = path.join(executablePath, `${com}${ext}`);
      if (fs.existsSync(extendedPath)) {
        execPath = extendedPath;
      }
    });
  });
  if (!execPath.length) throw new Error(`Cannot find command ${com}.`);
  return `${execPath}`;
};

const factory = (pathList: string []) => (cmd :string): string => findCommandPath(cmd, pathList);
export default findCommandPath;
export { factory };
