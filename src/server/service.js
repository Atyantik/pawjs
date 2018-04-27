import {
  Tapable,
  AsyncParallelHook,
  SyncHook
} from "tapable";
import React from "react";
import { renderToString } from "react-dom/server";
import { renderRoutes } from "react-router-config";
import { StaticRouter } from "react-router";

export default class ServerService extends Tapable {

  constructor(options) {
    super();
    this.hooks = {
      "clientBeforeRender": new AsyncParallelHook(),
      "clientRenderComplete": new SyncHook(),
    };
    this.options = options;
  }

  run({ routerService }) {
    const {env} = this.options;
    const root = _.get(env, "clientRootElementId", "app");

    this.hooks.clientBeforeRender.callAsync(() => {
      // Render according to routes!
      renderer(
        <StaticRouter>
          {renderRoutes(routerService.getRoutes())}
        </StaticRouter>,
        domRootReference,
        () => {
          this.hooks.clientRenderComplete.call();
        }
      );
    });
  }
}