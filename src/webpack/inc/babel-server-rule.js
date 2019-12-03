let presetEnv = require('@babel/preset-env');

presetEnv = presetEnv.default ? presetEnv.default : presetEnv;

let presetReact = require('@babel/preset-react');

presetReact = presetReact.default ? presetReact.default : presetReact;

let presetTypescript = require('@babel/preset-typescript');

presetTypescript = presetTypescript.default ? presetTypescript.default : presetTypescript;

let babelPlugins = require('../../babel/plugin');

babelPlugins = babelPlugins.default ? babelPlugins.default : babelPlugins;

const rule = options => ({
  test: /\.(mj|j|t)sx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          presetEnv,
          {
            targets: { node: '10.15.3' },
          },
        ],
        presetReact,
        presetTypescript,
      ],
      cacheDirectory: typeof options.cacheDirectory !== 'undefined' ? options.cacheDirectory : process.env.PAW_CACHE === 'true',
      plugins: babelPlugins(options),
    },
  },
});

module.exports = rule;
