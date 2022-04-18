import webpack from 'webpack';
import wHandler from '../webpack';

console.log(`
=========================================================
  Compiling files.
  This may take time depending on the application size.
  Thank you for your patience.
=========================================================
`);

try {
  // Web client configurations
  const libConfig = wHandler.getConfig(process.env.PAW_ENV, 'lib')?.[0];

  // Create a webpack web compiler from the web configurations
  const libCompiler = webpack({
    ...libConfig,
    watch: true,
  }, (err, stats) => {
    if (err) {
      console.log('Error', err);
      return;
    }
    console.log('Stats', stats?.toString?.({
      colors: true,
    }));
  });


  libCompiler.hooks.done.tap('InformWebCompiled', () => {
    console.log('Completed Lib compilation');
  });
} catch (ex) {
  // eslint-disable-next-line no-console
  console.error(ex);
}
