const fs = require('fs');
const path = require('path');

let directories = require('../utils/directories');

directories = directories.default ? directories.default : directories;

const rule = options => ({
  test: /\.tsx?$/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        compilerOptions: {
          sourceMap: Boolean(typeof options.sourceMap !== 'undefined' ? options.sourceMap : false),
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
});

module.exports = rule;
