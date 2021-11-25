const { getDefault } = require('../globals');
const supportedExtensions = getDefault(require('../extensions.js'));

const rule = (options) => ({
  test: supportedExtensions.javascriptRegExp,
  use: {
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
            refresh: false
          },
        },
      }
    }
  },
});

module.exports = rule;
