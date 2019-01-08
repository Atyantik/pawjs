let presetEnv = require('@babel/preset-env');

presetEnv = presetEnv.default ? presetEnv.default : presetEnv;

let presetReact = require('@babel/preset-react');

presetReact = presetReact.default ? presetReact.default : presetReact;

let babelPlugins = require('./babel-plugins');

babelPlugins = babelPlugins.default ? babelPlugins.default : babelPlugins;

const rule = (options = {}) => ({
  test: /\.jsx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          presetEnv,
          {
            targets: { node: '8.11.2' },
          },
        ],
        presetReact,
      ],
      cacheDirectory: typeof options.cacheDirectory !== 'undefined' ? options.cacheDirectory : process.env.PAW_CACHE === 'true',
      plugins: babelPlugins(options),
    },
  },
});

module.exports = rule;
