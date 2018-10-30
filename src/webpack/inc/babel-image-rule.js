const _ = require('lodash');
const directories = require('../utils/directories');

const defaultOptions = {
  outputPath: 'images/',
  name: '[hash].[ext]',
  context: directories.src,
};

const rule = options => ({
  test: /\.(jpe?g|png|gif|svg|webp|ico)$/i,
  use: [
    {
      loader: 'file-loader',
      options: _.assignIn({}, defaultOptions, options),
    },
  ],
});

module.exports = rule;
