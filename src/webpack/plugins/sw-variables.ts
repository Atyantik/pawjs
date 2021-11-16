import webpack from 'webpack';

class SwVariables {
  options: any;

  constructor(options: any = {}) {
    this.options = options;
  }

  apply(compiler: webpack.Compiler) {
    const { fileName, variables, text } = this.options;
    // webpack module instance can be accessed from the compiler object,
    // this ensures that correct version of the module is used
    // (do not require/import the webpack or any symbols from it directly).
    const { webpack } = compiler;

    // Compilation object gives us reference to some useful constants.
    const { Compilation } = webpack;

    // RawSource is one of the "sources" classes that should be used
    // to represent asset sources in compilation.
    const { RawSource } = webpack.sources;

    compiler.hooks.thisCompilation.tap('AddVariableToSw', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'AddVariableToSw',

          // Using one of the later asset processing stages to ensure
          // that all assets were already added to the compilation by other plugins.
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
        },
        (assets) => {
          if (assets[fileName]) {
            let src = assets[fileName].source();

            // Add env variables
            const pawEnv = Object.keys(process.env).filter(x => x.indexOf('PAW_') !== -1 && x !== 'PAW_CONFIG_PATH');
            const env = {};
            pawEnv.forEach((k) => {
              // @ts-ignore
              env[k] = process.env[k];
            });

            const { publicPath } = compilation.options.output;
            const assetList = Object.keys(assets).map(filePath => [publicPath, filePath].join('')).filter(f => f.indexOf('LICENSE.txt') === -1);
            // Append the manifest text
            const swRevision = JSON.stringify(new Date().getTime());
            src = `self.__PAW_MANIFEST=[
            { url: '${variables.appRootUrl || ''}/manifest.json', revision: ${swRevision} },
            { url: '${variables.appRootUrl || ''}/sw.js', revision: ${swRevision} },
            ];${src}`;

            if (assetList && assetList.length) {
              src = `${src};self.paw__offline_assets = ${JSON.stringify(assetList)}`;
            }

            if (variables) {
              src = `${src};self.paw__injected_variables = ${JSON.stringify(variables)};`;
            }
            if (text && text.length) {
              src = `${src};${text}`;
            }
            src = `self.paw__env=${JSON.stringify(env)};${src}`;
            compilation.updateAsset(
              fileName,
              new RawSource(src),
            );
          }
        }
      );
    });
  }
}

export default SwVariables;
