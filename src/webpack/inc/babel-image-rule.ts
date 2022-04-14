import { extensionRegex, imageAssetsExtensions } from '../utils/assets';

export default () => ({
  test: extensionRegex(imageAssetsExtensions),
  type: 'asset',
  // Not doing dataURL condition as it is causing issues with SVG #use in safari
  parser: {
    dataUrlCondition: {
      maxSize: 0, // You can make it 4kb by 4 * 1024
    },
  },
  generator: {
    // We will use content hash for long term caching of asset
    filename: 'images/[contenthash]-[name][ext][query]',
  },
});
