import assignIn from 'lodash/assignIn';
import directories from '../utils/directories';
import { extensionRegex, staticAssetsExtensions } from '../utils/assets';

const defaultOptions = {
  outputPath: 'assets/',
  name: '[contenthash].[ext]',
};

export default (options: any) => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset/resource',
  generator: {
    // We will use content hash for long term caching of asset
    filename: `${assignIn({}, defaultOptions, options).outputPath}[contenthash]-[name][ext][query]`,
  },
});
