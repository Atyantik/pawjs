import assignIn from 'lodash/assignIn';
import directories from '../utils/directories';

const defaultOptions = {
  outputPath: 'images/',
  name: '[contenthash].[ext]',
  context: directories.src,
};

export default (options: any) => ({
  test: /\.(jpe?g|png|gif|svg|webp|ico)$/i,
  use: [
    {
      loader: 'file-loader',
      options: assignIn({}, defaultOptions, options),
    },
  ],
});
