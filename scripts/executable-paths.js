const path = require("path");
const fs = require("fs");
const _ = require("lodash");

const projectRoot = (process.env.__project_root) || (process.env.PROJECT_ROOT) || (process.cwd() + path.sep);
const libRoot = process.env.__lib_root || path.resolve("../");

let allExecutablePaths = process.env.PATH.split(path.delimiter);

// Add library root to executable path
allExecutablePaths.unshift(libRoot);

// Include library's bin and it's node_modules's bin
fs.existsSync(path.join(libRoot, ".bin")) &&
allExecutablePaths.unshift(path.join(libRoot, ".bin"));

fs.existsSync(path.join(libRoot, "node_modules", ".bin")) &&
allExecutablePaths.unshift(path.join(libRoot, "node_modules", ".bin"));


// Add project root to executable path
allExecutablePaths.unshift(projectRoot);

// Include current folder bin and node_modules's bin
fs.existsSync(path.join(projectRoot, ".bin")) &&
allExecutablePaths.unshift(path.join(projectRoot, ".bin"));

fs.existsSync(path.join(projectRoot, "node_modules", ".bin")) &&
allExecutablePaths.unshift(path.join(projectRoot, "node_modules", ".bin"));

// If there are duplicate entries clear them up
allExecutablePaths = _.uniq(allExecutablePaths);

module.exports = allExecutablePaths;