import path from 'path';
import directories from './utils/directories';
import WebpackHandler from './handler';

/* global getDefault */
/* global pawExistsSync */

const handlerInstance = new WebpackHandler();
const hasProjectWebpackPlugin = pawExistsSync(path.join(directories.src, 'webpack'));
if (hasProjectWebpackPlugin) {
  const PROJECT_WEBPACK_PLUGIN = getDefault(
    // eslint-disable-next-line
    require(hasProjectWebpackPlugin),
  );
  handlerInstance.addPlugin(new PROJECT_WEBPACK_PLUGIN({ addPlugin: handlerInstance.addPlugin }));
}
export {
  WebpackHandler as handler,
};
export default handlerInstance;
