import webpack, { Compilation, sources } from 'webpack';

class SwVariables {
  options: any;

  constructor(options: any = {}) {
    this.options = options;
  }

  apply(compiler: webpack.Compiler) {
    const { fileName, variables, text } = this.options;
    compiler.hooks.thisCompilation.tap('AddVariableToSw', (compilation) => {
      const offlineAssetsMapping: any [] = [];
      const { chunks, options: { output: { publicPath } } } = compilation;
      chunks.forEach((chunk) => {
        if (!chunk.name) return;
        (chunk?.files ?? []).forEach((file) => {
          offlineAssetsMapping.push([publicPath, file].join(''));
        });
      });
      compilation.hooks.processAssets.tap(
        {
          name: 'AddVariableToSw',
          stage: webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE,
        },
        () => {
          const file = compilation.getAsset(fileName);
          let fileSource = file?.source?.source() ?? '';
          if (file && fileSource) {
            const swRevision = JSON.stringify(new Date().getTime());
            fileSource = `self.__PAW_MANIFEST=[
            { url: '${variables.appRootUrl || ''}/manifest.json', revision: ${swRevision} },
            { url: '${variables.appRootUrl || ''}/sw.js', revision: ${swRevision} },
            ];${fileSource}`;
            if (offlineAssetsMapping && offlineAssetsMapping.length) {
              fileSource = `${fileSource};self.paw__offline_assets = ${JSON.stringify(offlineAssetsMapping)}`;
            }

            if (variables) {
              fileSource = `${fileSource};self.paw__injected_variables = ${JSON.stringify(variables)};`;
            }
            if (text && text.length) {
              fileSource = `${fileSource};${text}`;
            }
            compilation.updateAsset(
              fileName,
              new sources.RawSource(fileSource),
            );
          }
        },
      );
    });
  }
}

export default SwVariables;
