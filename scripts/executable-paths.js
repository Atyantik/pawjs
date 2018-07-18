const path = require("path");
const fs = require("fs");
const _uniq = require("lodash/uniq");

const pRoot = (process.env.__project_root) || (process.env.PROJECT_ROOT) || (process.cwd() + path.sep);
const lRoot = process.env.__lib_root || path.resolve("../");

/**
 *
 * @param projectRoot
 * @param libRoot
 * @returns {Array}
 */
module.exports = (projectRoot = pRoot,libRoot = lRoot) => {
  let executablePaths = process.env.PATH.split(path.delimiter);

  // Add library root to executable path
  executablePaths.unshift(libRoot);

  // Include library's bin and it's node_modules's bin
  fs.existsSync(path.join(libRoot, ".bin")) &&
  executablePaths.unshift(path.join(libRoot, ".bin"));
  
  fs.existsSync(path.join(libRoot, "node_modules")) &&
  executablePaths.unshift(path.join(libRoot, "node_modules"));
  
  fs.existsSync(path.join(libRoot, "node_modules", ".bin")) &&
  executablePaths.unshift(path.join(libRoot, "node_modules", ".bin"));
  

  // Add project root to executable path
  executablePaths.unshift(projectRoot);

  // Include current folder bin and node_modules's bin
  fs.existsSync(path.join(projectRoot, ".bin")) &&
  executablePaths.unshift(path.join(projectRoot, ".bin"));
  
  fs.existsSync(path.join(projectRoot, "node_modules")) &&
  executablePaths.unshift(path.join(projectRoot, "node_modules"));
  
  fs.existsSync(path.join(projectRoot, "node_modules", ".bin")) &&
  executablePaths.unshift(path.join(projectRoot, "node_modules", ".bin"));

  // If there are duplicate entries clear them up
  executablePaths = _uniq(executablePaths);
  
  return executablePaths;
};