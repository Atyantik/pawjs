const configLabels = {
  MAX_QUALITY: {
    mozjpeg: {
      progressive: true,
      quality: 100,
    },
    optipng: {
      enabled: true,
    },
    pngquant: {
      quality: [0.95, 1],
      speed: 2,
    },
    gifsicle: {
      interlaced: false,
    },
    // webp: {
    //   quality: 100,
    // },
  },
  MEDIUM_QUALITY: {
    mozjpeg: {
      progressive: true,
      quality: 70,
    },
    optipng: {
      enabled: true,
    },
    pngquant: {
      quality: [0.65, 0.9],
      speed: 4,
    },
    gifsicle: {
      interlaced: false,
    },
    // webp: {
    //   quality: 80,
    // },
  },
  MIN_QUALITY: {
    mozjpeg: {
      progressive: true,
      quality: 55,
    },
    optipng: {
      enabled: false,
    },
    pngquant: {
      quality: [0.45, 0.65],
      speed: 10,
    },
    gifsicle: {
      interlaced: false,
    },
    // webp: {
    //   quality: 65,
    // },
  },
};

export default class PawImageOptimizerWebpack {
  constructor(options = {}) {
    this.supportedEnv = options.supportedEnv || ['production'];
    this.config = typeof options.config !== 'undefined' ? options.config : null;
    this.configLabel = options.configLabel || 'MEDIUM_QUALITY';
  }

  apply(webpackHandler) {
    webpackHandler.hooks.beforeConfig.tap('AddWebpackImageLoader', (env, type, config) => {
      try {
        let conf = config;
        if (this.supportedEnv.indexOf(env.toLowerCase()) === -1) return;

        if (!Array.isArray(config)) {
          conf = [config];
        }
        conf.forEach((c) => {
          const moduleRules = c.module.rules;

          const imageRules = moduleRules.filter(rule => (rule.test.test('.jpeg') || rule.test.test('.png') || rule.test.test('.svg')));
          imageRules.forEach((imageRule) => {
            const alreadyExists = imageRule.use.find(e => e.loader === 'image-webpack-loader');
            if (alreadyExists) return;
            const fileLoaderIndex = imageRule.use.map(l => l.loader).indexOf('file-loader');
            if (fileLoaderIndex === -1) return;

            const optimizerConfig = {
              loader: 'image-webpack-loader',
              options: this.config
                ? this.config : (configLabels[this.configLabel] || configLabels.MEDIUM_QUALITY),
            };

            imageRule.use.splice(fileLoaderIndex + 1, 0, optimizerConfig);
          });
        });
      } catch (ex) {
        // eslint-disable-next-line
        console.log(ex);
      }
    });
  }
}
