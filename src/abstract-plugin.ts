import each from 'lodash/each';
import { IPlugin } from './@types/pawjs';

export default abstract class AbstractPlugin {
  hooks: any;

  constructor() {
    this.addPlugin = this.addPlugin.bind(this);
  }

  addPlugin(plugin: IPlugin): void {
    try {
      if (plugin.hooks && Object.keys(plugin.hooks).length) {
        each(plugin.hooks, (hookValue, hookName) => {
          this.hooks[hookName] = hookValue;
        });
      }
    } catch (ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    if (plugin.apply) {
      // "this" - for example may be: instance of ClientHandler, RouteHandler or ServerHandler
      plugin.apply(this);
    }
  }
}
