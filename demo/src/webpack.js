import SassPlugin from '@pawjs/sass/webpack';
import ImageOptimizerPlugin from '@pawjs/image-optimizer/webpack';
import SrcsetPlugin from '../../packages/pawjs-srcset/src/webpack';

export default class ClientWebpack {
  constructor({ addPlugin }) {
    addPlugin(new SassPlugin());
    addPlugin(new ImageOptimizerPlugin({ supportedEnv: ['production', 'development'] }));
    addPlugin(new SrcsetPlugin());
  }
}
