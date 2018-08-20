const path = require("path");
const fs = require("fs");
const _uniq = require("lodash/uniq");

const pRoot = (process.env.__project_root) || (process.env.PROJECT_ROOT) || (process.cwd() + path.sep);
const lRoot = process.env.__lib_root || path.resolve(__dirname, "../");

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
  
  // Add parent directory node_modules of pawjs to the list
  fs.existsSync(path.join(libRoot, "..", "node_modules")) &&
  executablePaths.unshift(path.join(libRoot, "..", "node_modules"));
  
  // Add parent directory node_modules of pawjs to the list
  fs.existsSync(path.join(libRoot, "..", "..", "node_modules")) &&
  executablePaths.unshift(path.join(libRoot, "..", "..", "node_modules"));
  
  // Add parent to parent directory
  // thus trying to add directory storing @pawjs/pawjs for resolution
  fs.existsSync(path.join(libRoot, "..", "..", "..", "node_modules")) &&
  executablePaths.unshift(path.join(libRoot, "..", "..", "..", "node_modules"));
  
  fs.existsSync(path.join(libRoot, "..", "node_modules", ".bin")) &&
  executablePaths.unshift(path.join(libRoot, "..", "node_modules", ".bin"));
  
  // Add project root to executable path
  executablePaths.unshift(projectRoot);
  
  // Include current folder bin and node_modules's bin
  fs.existsSync(path.join(projectRoot, ".bin")) &&
  executablePaths.unshift(path.join(projectRoot, ".bin"));
  
  fs.existsSync(path.join(projectRoot, "node_modules")) &&
  executablePaths.unshift(path.join(projectRoot, "node_modules"));
  
  fs.existsSync(path.join(projectRoot, "node_modules", ".bin")) &&
  executablePaths.unshift(path.join(projectRoot, "node_modules", ".bin"));
  
  // If library root is current directory, i.e. we are developing pawjs,
  // then include the node_modules from packages as well.
  if(lRoot === process.cwd()) {
    const packages = fs.readdirSync(path.join(libRoot, "packages"));
    packages.forEach(p => {
      const packagePath = path.join(libRoot, "packages", p);
      
      // Include package folder bin and node_modules's bin
      fs.existsSync(path.join(packagePath, ".bin")) &&
      executablePaths.unshift(path.join(packagePath, ".bin"));
      
      fs.existsSync(path.join(projectRoot, "node_modules")) &&
      executablePaths.unshift(path.join(packagePath, "node_modules"));
      
      fs.existsSync(path.join(packagePath, "node_modules", ".bin")) &&
      executablePaths.unshift(path.join(packagePath, "node_modules", ".bin"));
    });
  }
  
  // If there are duplicate entries clear them up
  executablePaths = _uniq(executablePaths);
  
  return executablePaths;
};