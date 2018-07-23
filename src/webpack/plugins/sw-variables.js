class SwVariables {
  constructor(options = {}) {
    this.options = options;
  }
  apply(compiler) {

    const { fileName, variables, text } = this.options;

    compiler.hooks.emit.tap("AddVariableToSw",  (compilation) => {
      const chunks = compilation.chunks;

      const publicPath = compilation.options.output.publicPath;
      const offlineAssetsMapping = [];

      // Start out by getting metadata for all the assets associated with a chunk.
      for (const chunk of chunks) {
        if (!chunk.name) continue;
        for (const file of chunk.files) {
          offlineAssetsMapping.push([publicPath, file].join(""));
        }
      }

      if (compilation.assets[fileName]) {
        let src = compilation.assets[fileName].source();

        if (offlineAssetsMapping && offlineAssetsMapping.length) {
          src = `${src};self.__offline_assets = ${JSON.stringify(offlineAssetsMapping)}`;
        }

        if (variables) {
          src = `${src};self.__injected_variables = ${JSON.stringify(variables)};`;
        }
        if (text && text.length) {
          src = `${src};${text}`;
        }

        compilation.assets[fileName] = {
          source: function source() {
            return src;
          },
          size: function size() {
            return src.length;
          }
        };
      }
    });
  
    compiler.hooks.emit.tap("AddEnvToSw",  (compilation) => {
      
      if (compilation.assets[fileName]) {
        let src = compilation.assets[fileName].source();
        
        const pawEnv = Object.keys(process.env).filter(x => x.indexOf("PAW_") !== -1);
        let env = {};
        pawEnv.forEach(k => {
          env[k] = process.env[k];
        });
        
        src = `self.__env=${JSON.stringify(env)};${src}`;
        
      
        compilation.assets[fileName] = {
          source: function source() {
            return src;
          },
          size: function size() {
            return src.length;
          }
        };
      }
    });
  }
}

module.exports = SwVariables;