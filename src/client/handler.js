import {
  Tapable,
  AsyncParallelHook,
  SyncHook,
} from "tapable";
import _ from "lodash";
import React from "react";
import { renderRoutes, matchRoutes } from "react-router-config";
import { BrowserRouter } from "react-router-dom";
import { render, hydrate } from "react-dom";
import ErrorBoundary from "../components/ErrorBoundary";

export default class ClientService extends Tapable {

  constructor(options) {
    super();
    this.hooks = {

    };
    this.hooks = {
      "locationChange": new AsyncParallelHook(["page", "title", "location"]),
      "beforeRender": new AsyncParallelHook(),
      "renderComplete": new SyncHook(),
    };
    this.options = options;
    this.addServiceWorker();
  }

  addServiceWorker() {
    if (!this.options.env.serviceWorker) return;
    this.hooks.renderComplete.tap("AddServiceWorker", (err) => {
      if (err) return;
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("/sw.js");
          // .then(registration => {
          //   console.log("SW registered: ", registration);
          // }).catch(registrationError => {
          //   console.log("SW registration failed: ", registrationError);
          // });
        });
      }
    });
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

  run({ routeHandler }) {
    const {env} = this.options;
    const root = _.get(env, "clientRootElementId", "app");

    if (!document.getElementById(root)) {
      // eslint-disable-next-line
      console.warn(`#${root} element not found in html. thus cannot proceed further`);
    }
    const domRootReference = document.getElementById(root);
    const renderer = env.serverSideRender ? hydrate: render;

    this.hooks.beforeRender.callAsync(() => {

      const routes = routeHandler.getRoutes();

      let currentPageRoutes = matchRoutes(routes, window.location.pathname);

      let promises = [];

      if (window.__preloaded_data) {
        currentPageRoutes.forEach((r,i) => {

          window.__preloaded_data[i] &&
          r.route && r.route.component && r.route.component.preload &&
          (promises.push(r.route.component.preload(window.__preloaded_data[i])));
        });
      }

      Promise.all(promises).then(() => {
        // Render according to routes!
        renderer(
          <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
            <BrowserRouter>
              {renderRoutes(routes)}
            </BrowserRouter>
          </ErrorBoundary>,
          domRootReference,
          //div,
          () => {
            window.__preloaded_data = null;
            delete window.__preloaded_data;
            document.getElementById("__pawjs_preloaded") && document.getElementById("__pawjs_preloaded").remove();
            this.hooks.renderComplete.call();
          }
        );
      });

    });
  }
}