import assignIn from 'lodash/assignIn';
import directories from '../utils/directories';
import { extensionRegex, imageAssetsExtensions } from '../utils/assets';

const defaultOptions = {
  outputPath: 'images/',
  publicPath: 'images/',
  name: '[contenthash].[ext]',
  context: directories.src,
};

export default (options: any) => ({
  test: extensionRegex(imageAssetsExtensions),
  type: 'asset',
  parser: {
    dataUrlCondition: {
      maxSize: 4 * 1024, // 4kb
    },
  },
  generator: {
    // We will use content hash for long term caching of asset
    filename: `${assignIn({}, defaultOptions, options).publicPath}[contenthash]-[name][ext][query]`,
  },
});
