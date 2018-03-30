import {
  Tapable,
  AsyncParallelHook,
  SyncHook
} from "tapable";
import React from "react";
import {render, hydrate} from "react-dom";

export default class ClientService extends Tapable {
  serviceManager = null;

  constructor(options) {
    super();
    this.hooks = {
      "pageChange": new AsyncParallelHook(["page", "title", "location"]),
      "beforeRender": new AsyncParallelHook(),
      "renderComplete": new SyncHook(),
    };
    this.options = options;
  }
  setServiceManager(serviceManager) {
    this.serviceManager = serviceManager;
    return this;
  }

  initPlugins(plugins = []) {
    if (!plugins || !Array.isArray(plugins)) return false;

    for(const plugin of plugins) {
      this.addPlugin(plugin);
    }
  }

  addPlugin(plugin) {
    try {
      let pluginInstance = plugin;
      if (typeof plugin === "string") {
        pluginInstance  = new (require(`${plugin}`).client);
      }

      pluginInstance.apply && pluginInstance.apply(this.serviceManager);
    } catch (ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
  }

  run() {
    const {root, env} = this.options;

    if (!document.getElementById(root)) {
      // eslint-disable-next-line
      console.warn(`#${root} element not found in html. thus cannot proceed further`);
    }
    const domRootReference = document.getElementById(root);
    const renderer = env.serverSideRender ? hydrate: render;

    this.hooks.beforeRender.callAsync(() => {
      renderer(
        <div>Tirth Bodawala</div>,
        domRootReference,
        () => {
          this.hooks.renderComplete.call();
        }
      );
    });
  }
}