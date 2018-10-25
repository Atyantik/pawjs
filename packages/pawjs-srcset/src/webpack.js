export default class PawSrcsetWebpack {
  // eslint-disable-next-line
  apply(webpackHandler) {
    webpackHandler.hooks.beforeConfig.tap('AddPwaSrcsetLoader', (env, type, config) => {
      try {
        let conf = config;
        if (!Array.isArray(config)) {
          conf = [config];
        }
        conf.forEach((c) => {
          const moduleRules = c.module.rules;

          moduleRules.forEach((imageRule, imageRuleIndex) => {
            // Do not do anything if the current rule is not for image
            if (!(imageRule.test.test('.jpeg') || imageRule.test.test('.png') || imageRule.test.test('.svg'))) return;

            // Do not do anything if pwa-srcset is already loaded for the image rule
            if (JSON.stringify(imageRule).indexOf('pwa-srcset-loader') !== -1) return;

            // Do not do anything if { use: ... } is not found inside the image rule
            if (!imageRule.use) return;

            let ruleUse;

            if (typeof imageRule.use === 'string') {
              ruleUse = imageRule.use;
            } else {
              ruleUse = typeof imageRule.use === 'object'
                ? JSON.parse(JSON.stringify(imageRule.use)) : imageRule.use;
            }

            let ruleUseClone;

            if (typeof imageRule.use === 'string') {
              ruleUseClone = imageRule.use;
            } else {
              ruleUseClone = typeof imageRule.use === 'object'
                ? JSON.parse(JSON.stringify(imageRule.use)) : imageRule.use;
            }

            const replacableRule = {
              test: imageRule.test,
              oneOf: [
                {
                  resourceQuery: /[?&](sizes|placeholder)(=|&|\[|$)/,
                  use: [
                    {
                      loader: 'pwa-srcset-loader',
                    },
                    ...ruleUseClone,
                  ],
                },
                {
                  use: ruleUse,
                },
              ],
            };

            moduleRules.splice(imageRuleIndex, 1, replacableRule);
          });
        });
      } catch (ex) {
        // eslint-disable-next-line
        console.log(ex);
      }
    });
  }
}
