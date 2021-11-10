import assignIn from 'lodash/assignIn';
import { extensionRegex, staticAssetsExtensions } from '../utils/assets';

const defaultOptions = {
  outputPath: 'assets/',
};

export default (options: any) => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset/resource',
  generator: {
    // We will use content hash for long term caching of asset
    filename: `${assignIn({}, defaultOptions, options).outputPath}[contenthash]-[name][ext][query]`,
  },
});
