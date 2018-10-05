import fs from 'fs';
import path from 'path';
import WebpackHandler from './handler';

const handlerInstance = new WebpackHandler();

const processDir = process.cwd();
let projectRoot = process.env.PROJECT_ROOT || process.env.PROJECT_ROOT || (processDir + path.sep);
projectRoot = path.isAbsolute(projectRoot) ? projectRoot : path.resolve(processDir, projectRoot);

if (fs.existsSync(path.join(projectRoot, 'src', 'webpack.js'))) {
  // eslint-disable-next-line
  let ProjectWebpackPlugin = require(path.join(projectRoot, 'src', 'webpack.js'));
  if (ProjectWebpackPlugin.default) {
    ProjectWebpackPlugin = ProjectWebpackPlugin.default;
  }
  handlerInstance.addPlugin(new ProjectWebpackPlugin({ addPlugin: handlerInstance.addPlugin }));
}

module.exports = handlerInstance;
module.exports.handler = WebpackHandler;
