const rule = () => ({
  test: /\.(j|t)sx?$/,
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
