import webpack from 'webpack';

class SwVariables {
  options: any;

  constructor(options: any = {}) {
    this.options = options;
  }

  apply(compiler: webpack.Compiler) {
    const { fileName, variables, text } = this.options;

    compiler.hooks.emit.tap('AddVariableToSw', (compilation) => {
      const { chunks } = compilation;

      // @ts-ignore
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
        // Append the manifest text
        const swRevision = JSON.stringify(new Date().getTime());
        src = `self.__PAW_MANIFEST=[
        { url: '/manifest.json', revision: ${swRevision} },
        { url: '/sw.js', revision: ${swRevision} },
        ];${src}`;
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

        const pawEnv = Object.keys(process.env).filter(x => x.indexOf('PAW_') !== -1 && x !== 'PAW_CONFIG_PATH');
        const env = {};
        pawEnv.forEach((k) => {
          // @ts-ignore
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

export default SwVariables;
