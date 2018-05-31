import _ from "lodash";
import { Tapable, AsyncSeriesHook } from "tapable";


export default class ServiceManager extends Tapable {

  routerService = new RouterService();

  constructor({env, handler}) {
    super();
    this.hooks = {
      "initRoutes": new AsyncSeriesHook(["Router"])
    };
    this.env = env;
    this.handler = new handler({env});
  }

  addPlugin(plugin) {
    try {
      _.each(plugin.hooks, (hookValue, hookName) => {
        this.hooks[hookName] = hookValue;
      });
    } catch(ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    plugin.apply(this);
  }
  addPluginRoutes(routes) {
    try {
      _.each(routes.hooks, (hookValue, hookName) => {
        this.hooks[hookName] = hookValue;
      });
    } catch(ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    routes.apply(this);
  }

  run() {
    this.hooks.initRoutes.callAsync(this.routerService, err => {
      if (err) {
        // eslint-disable-next-line
        console.log(err);
        return;
      }

      this.handler.run({
        routerService: this.routerService
      });
    });
  }

}