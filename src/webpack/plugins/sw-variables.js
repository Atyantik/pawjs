class SwVariables {
  constructor(options = {}) {
    this.options = options;
  }

  apply(compiler) {
    const { fileName, variables, text } = this.options;

    compiler.hooks.emit.tap('AddVariableToSw', (compilation) => {
      const { chunks } = compilation;

      const { publicPath } = compilation.options.output;
      const offlineAssetsMapping = [];

      // Start out by getting metadata for all the assets associated with a chunk.
      // eslint-disable-next-line
      for (const chunk of chunks) {
        // eslint-disable-next-line
        if (!chunk.name) continue;
        // eslint-disable-next-line
        for (const file of chunk.files) {
          offlineAssetsMapping.push([publicPath, file].join(''));
        }
      }

      if (compilation.assets[fileName]) {
        let src = compilation.assets[fileName].source();

        if (offlineAssetsMapping && offlineAssetsMapping.length) {
          src = `${src};self.paw__offline_assets = ${JSON.stringify(offlineAssetsMapping)}`;
        }

        if (variables) {
          src = `${src};self.paw__injected_variables = ${JSON.stringify(variables)};`;
        }
        if (text && text.length) {
          src = `${src};${text}`;
        }

        // eslint-disable-next-line
        compilation.assets[fileName] = {
          source: function source() {
            return src;
          },
          size: function size() {
            return src.length;
          },
        };
      }
    });

    compiler.hooks.emit.tap('AddEnvToSw', (compilation) => {
      if (compilation.assets[fileName]) {
        let src = compilation.assets[fileName].source();

        const pawEnv = Object.keys(process.env).filter(x => x.indexOf('PAW_') !== -1);
        const env = {};
        pawEnv.forEach((k) => {
          env[k] = process.env[k];
        });

        src = `self.paw__env=${JSON.stringify(env)};${src}`;

        // eslint-disable-next-line
        compilation.assets[fileName] = {
          source: function source() {
            return src;
          },
          size: function size() {
            return src.length;
          },
        };
      }
    });
  }
}

module.exports = SwVariables;
