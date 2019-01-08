const fs = require('fs');
const path = require('path');
const _ = require('lodash');

let directories = require('../utils/directories');

directories = directories.default ? directories.default : directories;

const isProduction = process.env.PAW_ENV === 'production';
const defaultOptions = {
  onlyBabel: false,
  cacheDirectory: process.env.PAW_CACHE === 'true',
  sourceMap: !isProduction,
};

const rule = (options = {}) => {
  const o = _.assignIn({}, defaultOptions, options);
  return {
    test: /\.tsx?$/,
    use: [
      {
        loader: 'ts-loader',
        options: {
          compilerOptions: {
            sourceMap: o.sourceMap,
            jsx: 'React',
          },
          transpileOnly: true,
          configFile: (
            fs.existsSync(path.join(directories.root, 'tsconfig.json'))
              ? path.join(directories.root, 'tsconfig.json')
              : path.resolve(path.join(__dirname, '..', '..', '..', 'tsconfig.json'))
          ),
        },
      },
    ],
  };
};
module.exports = rule;
