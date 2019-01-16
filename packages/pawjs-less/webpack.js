export default class PawImageOptimizerWebpack {
  constructor(lessOptions = {}) {
    this.lessOptions = lessOptions;
    this.hooks = {};
  }

  // eslint-disable-next-line
  apply(webpackHandler) {
    const babelCssRule = webpackHandler.getBabelCssRule();
    webpackHandler.hooks.beforeConfig.tap('AddWebpackLessLoader', (env, type, config) => {
      let doCompress = env === 'production';
      let sourceMap = env !== 'production';
      try {
        let conf = config;

        if (!Array.isArray(config)) {
          conf = [config];
        }
        conf.forEach((c) => {
          const moduleRules = c.module.rules;

          const lessExists = moduleRules.some(rule => rule.test.test('.less'));
          if (lessExists) {
            return;
          }

          let cssRules = moduleRules.filter(rule => rule.test.test('.css'));
          if (!cssRules.length) {
            cssRules = babelCssRule();
          }

          const lessRules = [];

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
              loader: 'less-loader',
              options: Object.assign({}, {
                sourceMap,
              }, this.lessOptions),
            });

            lessRules.push({
              test: /\.less$/,
              ...others,
              use: newUse,
            });
          });

          // eslint-disable-next-line
          c.module.rules = [...c.module.rules, ...lessRules];
        });
      } catch (ex) {
        // eslint-disable-next-line
        console.log(ex);
      }
    });
  }
}
