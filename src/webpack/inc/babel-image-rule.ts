import assignIn from 'lodash/assignIn';
import { RuleSetUse } from 'webpack';
import directories from '../utils/directories';

const defaultOptions = {
  publicPath: '',
  outputPath: 'images/',
  name: '[contenthash]-[name].[ext]',
  context: directories.src,
};

export default (options: RuleSetUse & typeof defaultOptions) => ({
  test: /\.(jpe?g|png|gif|svg|webp|ico)$/i,
  use: [
    {
      loader: 'file-loader',
      options: assignIn({}, defaultOptions, options),
    },
  ],
});
