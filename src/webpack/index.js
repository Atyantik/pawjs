import fs from "fs";
import path from "path";
import WebpackHandler from "./handler";

const handlerInstance = new WebpackHandler();

const processDir = process.cwd();
let project_root = process.env.__project_root || process.env.PROJECT_ROOT || (processDir + path.sep);
project_root = path.isAbsolute(project_root) ? project_root: path.resolve(processDir, project_root);

if (fs.existsSync(path.join(project_root, "src", "webpack.js"))) {
  let ProjectWebpackPlugin = require(path.join(project_root, "src" ,"webpack.js"));
  if (ProjectWebpackPlugin.default) {
    ProjectWebpackPlugin = ProjectWebpackPlugin.default;
  }
  handlerInstance.addPlugin(new ProjectWebpackPlugin({addPlugin: handlerInstance.addPlugin}));
}

module.exports = handlerInstance;
module.exports.handler = WebpackHandler;
