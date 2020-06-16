import { Hook, SyncHook } from '@pawjs/tapable';

// non npm imports
import serverConfig from './server.config';
import webConfig from './web.config';
import babelCssRules from './inc/babel-css-rule';
import AbstractPlugin from '../abstract-plugin';

export default class WebpackHandler extends AbstractPlugin {
  hooks: {
    init: SyncHook<any, any>;
    beforeConfig: SyncHook<any, any>;
    [s: string]: Hook<any, any> | SyncHook<any, any>;
  };

  private readonly envConfigs: {
    [s: string]: {
      server: any[];
      web: any[];
      [s: string]: any[];
    };
  };

  constructor() {
    super();
    this.hooks = {
      init: new SyncHook(),
      beforeConfig: new SyncHook(['env', 'type', 'config']),
    };
    this.envConfigs = {
      development: {
        web: [webConfig],
        server: [serverConfig],
      },
      production: {
        web: [webConfig],
        server: [serverConfig],
      },
    };
  }

  // eslint-disable-next-line
  getBabelCssRule() {
    return babelCssRules;
  }

  getConfig(env = 'development', type = 'web') {
    if (this.envConfigs[env] && this.envConfigs[env][type]) {
      this.hooks.beforeConfig.call(env, type, this.envConfigs[env][type]);
      return this.envConfigs[env][type];
    }
    if (env === 'test') return {};
    throw new Error(`Cannot find appropriate config for environment ${env} & type ${type}`);
  }
}
