const fs = require("fs");
const path = require("path");
const directories = require("../utils/directories");

const emptyClass = path.resolve(process.env.__lib_root, "src", "webpack", "utils", "emptyClass.js");
const projectClientPath = `${process.env.__project_root}/src/client.js`;
const projectClientExists = fs.existsSync(projectClientPath);

const projectServerPath = `${process.env.__project_root}/src/server.js`;
const projectServerExists = fs.existsSync(projectServerPath);

let commonResolvers = [
  path.resolve(path.join(directories.root, "node_modules"))
];


fs.existsSync(path.join(process.env.__lib_root, "node_modules")) &&
commonResolvers.push(path.join(process.env.__lib_root, "node_modules"));

fs.existsSync(path.join(process.env.__lib_root, "..", "node_modules")) &&
commonResolvers.push(path.join(process.env.__lib_root, "..", "node_modules"));

fs.existsSync(path.join(process.env.__lib_root, "..", "..","node_modules")) &&
commonResolvers.push(path.join(process.env.__lib_root, "..", "..","node_modules"));

fs.existsSync(path.join(process.env.__lib_root, "..", "..", "..","node_modules")) &&
commonResolvers.push(path.join(process.env.__lib_root, "..", "..", "..","node_modules"));

let loaderResolver = commonResolvers.slice(0);
loaderResolver.push(path.join(process.env.__lib_root, "src", "webpack", "loaders"));

module.exports = module.exports.default = {
  resolve: {
    alias: {
      pawjs: path.resolve(path.join(process.env.__lib_root)),
      pawProjectClient: projectClientExists? projectClientPath: emptyClass,
      pawProjectServer: projectServerExists? projectServerPath: emptyClass
    },
    modules: commonResolvers
  },
  resolveLoader: {
    modules: loaderResolver
  }
};