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
    ],
    use: [
      {
        loader: 'swc-loader',
        options: {
          jsc: {
            parser: {
              syntax: "typescript",
              tsx: true,
            },
            transform: {
              react: {
                runtime: 'automatic',
                pragma: 'React.createElement',
                pragmaFrag: 'React.Fragment',
                throwIfNamespace: true,
                development: process.env.PAW_ENV === 'development',
                useBuiltins: false,
                refresh: isHot
              },
            },
          }
        }
      },
      {
        loader: 'prefetch-loader',
      },
    ],
  };
};
module.exports = rule;
