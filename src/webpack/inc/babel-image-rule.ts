import { extensionRegex, imageAssetsExtensions } from '../utils/assets';

export default () => ({
  test: extensionRegex(imageAssetsExtensions),
  type: 'asset',
  // Not doing dataURL condition as it is causing issues with SVG #use in safari
  // parser: {
  //   dataUrlCondition: {
  //     maxSize: 4 * 1024, // 4kb
  //   },
  // },
  generator: {
    // We will use content hash for long term caching of asset
    filename: 'images/[contenthash]-[name][ext][query]',
  },
});
