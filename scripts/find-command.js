const path = require("path");
const fs = require("fs");
const _ = require("lodash");

// Find command from all the paths possible
function findCommandPath(com, pathList) {
  let execPath = "";
  const possibleExtension = ["", ".exe", ".cmd"];
  _.each(pathList, executablePath => {
    if (execPath.length) return;

    _.each(possibleExtension, ext => {
      if (execPath.length) return;

      const extendedPath = path.join(executablePath, `${com}${ext}`);
      if (fs.existsSync(extendedPath)) {
        execPath = extendedPath;
      }
    });
  });
  if (!execPath.length) throw new Error(`Cannot find command ${com}.`);
  return `${execPath}`;
}

module.exports = findCommandPath;
module.exports.factory = function(pathList) {
  return cmd => {
    return findCommandPath(cmd, pathList);
  };
};