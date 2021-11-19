import { extensionRegex, staticAssetsExtensions } from '../utils/assets';

export default () => ({
  test: extensionRegex(staticAssetsExtensions),
  type: 'asset/resource',
  generator: {
    // We will use content hash for long term caching of asset
    filename: 'assets/[contenthash]-[name][ext][query]',
  },
});
