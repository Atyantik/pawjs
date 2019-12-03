export default class PawImageOptimizerWebpack {
  // eslint-disable-next-line
  apply(webpackHandler) {
    const babelCssRule = webpackHandler.getBabelCssRule();
    webpackHandler.hooks.beforeConfig.tap('AddWebpackSassLoader', (env, type, config) => {
      let doCompress = env === 'production';
      let sourceMap = env !== 'production';
      try {
        let conf = config;

        if (!Array.isArray(config)) {
          conf = [config];
        }
        conf.forEach((c) => {
          const moduleRules = c.module.rules;

          const sassExists = moduleRules.some(rule => (rule.test.test('.scss') || rule.test.test('.sass')));
          if (sassExists) {
            return;
          }

          let cssRules = moduleRules.filter(rule => rule.test.test('.css'));
          if (!cssRules.length) {
            cssRules = babelCssRule();
          }

          const sassRules = [];

          cssRules.forEach((cssRule) => {
            // eslint-disable-next-line
            let {test, use,...others} = cssRule;
            const newUse = cssRule.use.slice(0);

            const cssLoader = cssRule.use.find(u => u.loader === 'css-loader');
            if (cssLoader) {
              doCompress = typeof cssLoader.options.minimize !== 'undefined' ? Boolean(cssLoader.options.minimize) : doCompress;
              sourceMap = typeof cssLoader.options.sourceMap !== 'undefined' ? Boolean(cssLoader.options.sourceMap) : sourceMap;
            }
            newUse.push({
              loader: 'sass-loader',
              options: {
                sourceMap,
              },
            });

            sassRules.push({
              test: /\.(sass|scss)$/,
              ...others,
              use: newUse,
            });
          });
          c.module.rules = [...c.module.rules, ...sassRules];
        });
      } catch (ex) {
        // eslint-disable-next-line
        console.log(ex);
      }
    });
  }
}
