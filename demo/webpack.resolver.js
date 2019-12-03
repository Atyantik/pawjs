const path = require('path');

module.exports = {
  resolve: {
    root: path.resolve(__dirname),
    extensions: [
      '.mjs',
      '.mjsx',
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
    ],
  },
};
