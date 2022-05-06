const { getDefault } = require('../../globals');
const babelPresetEnv = getDefault(require('@babel/preset-env'));
const babelPresetReact = getDefault(require('@babel/preset-react'));
const presetTypescript = getDefault(require('@babel/preset-typescript'));
const babelPlugins = getDefault(require('../../babel/plugin'));

const cacheDirectory = process.env.PAW_CACHE === 'true';
const isProduction = process.env.PAW_ENV === 'production';
const isStartCmd = process.env.PAW_START_CMD === 'true';
const isHot = !isProduction && isStartCmd && process.env.PAW_HOT === 'true';

const rule = () => {
  return {
    test: /\.(j|t)sx?$/,
    exclude: [
      /node_modules\/(?!(@pawjs|pawjs-)).*/,
      /sw.js/,
      /service-worker.js/,
      /core-js/,
      /webpack\/builtin/,
    ],
    use: [
      {
        loader: 'babel-loader',
        options: {
          sourceType: 'unambiguous',
          compact: false,
          retainLines: true,
          presets: [
            [
              babelPresetEnv,
              {
                useBuiltIns: 'usage',
                corejs: '3.6',
                targets: {
                  // Target all browsers that are not dead
                  browsers: ['defaults', 'not dead'],
                },
              },
            ],
            [
              babelPresetReact,
              {
                runtime: 'automatic',
                useBuiltIns: true,
                development: !isProduction,
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
          plugins: babelPlugins({ useDynamicImport: true, hotRefresh: isHot }),
        },
      },
      {
        loader: 'prefetch-loader',
      },
    ],
  };
};
module.exports = rule;
