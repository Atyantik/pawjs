import _ from 'lodash';
import { SyncHook } from 'tapable';

// non npm imports
import serverConfig from './server.config';
import webConfig from './web.config';
import babelCssRules from './inc/babel-css-rule';

export default class WebpackHandler {
  constructor(options) {
    this.hooks = {
      init: new SyncHook([]),
      beforeConfig: new SyncHook(['env', 'type', 'config']),
    };
    this.options = options;
    this.addPlugin = this.addPlugin.bind(this);
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

  addPlugin(plugin) {
    try {
      if (plugin.hooks && Object.keys(plugin.hooks).length) {
        _.each(plugin.hooks, (hookValue, hookName) => {
          this.hooks[hookName] = hookValue;
        });
      }
    } catch (ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    if (plugin.apply) {
      plugin.apply(this);
    }
  }

  getConfig(env = 'development', type = 'web') {
    if (this.envConfigs[env] && this.envConfigs[env][type]) {
      this.hooks.beforeConfig.call(env, type, this.envConfigs[env][type], (err) => {
        if (err) {
          // eslint-disable-next-line
          console.log(err);
        }
      });
      return this.envConfigs[env][type];
    }
    if (env === 'test') return {};
    throw new Error(`Cannot find appropriate config for environment ${env} & type ${type}`);
  }
}
