const { getDefault }  = require('../../globals');
const presetEnv = getDefault(require('@babel/preset-env'));
const presetReact = getDefault(require('@babel/preset-react'));
const presetTypescript = getDefault(require('@babel/preset-typescript'));
const babelPlugins = getDefault(require('../../babel/plugin'));

const cacheDirectory = process.env.PAW_CACHE === 'true';

const rule = () => ({
  test: /\.(j|t)sx?$/,
  use: {
    loader: 'babel-loader',
    options: {
      compact: false,
      presets: [
        [
          presetEnv,
          {
            targets: { node: '12' },
          },
        ],
        [
          presetReact,
          {
            runtime: 'automatic',
          },
        ],
        [
          presetTypescript,
          {
            allowDeclareFields: true
          },
        ],
      ],
      cacheDirectory,
      plugins: babelPlugins({ useDynamicImport: false }),
    },
  },
});

module.exports = rule;
