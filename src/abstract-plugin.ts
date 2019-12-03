import each from 'lodash/each';
import { IPlugin } from './@types/pawjs';

export default abstract class AbstractPlugin {
  hooks: any;

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
      plugin.apply(this);
    }
  }
}
