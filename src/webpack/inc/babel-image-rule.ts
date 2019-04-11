import assignIn from 'lodash/assignIn';
import { RuleSetQuery } from 'webpack';
import directories from '../utils/directories';

const defaultOptions = {
  outputPath: 'images/',
  name: '[hash].[ext]',
  context: directories.src,
};

export default (options: RuleSetQuery) => ({
  test: /\.(jpe?g|png|gif|svg|webp|ico)$/i,
  use: [
    {
      loader: 'file-loader',
      options: assignIn({}, defaultOptions, options),
    },
  ],
});
