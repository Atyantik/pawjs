import {
  Tapable,
  AsyncParallelHook,
  AsyncParallelBailHook,
  SyncHook,
} from "tapable";
import _ from "lodash";
import React from "react";
import { renderRoutes, matchRoutes } from "react-router-config";
import { Router } from "react-router";
import { createBrowserHistory } from "history";
import { render, hydrate } from "react-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import {generateMeta} from "../utils/seo";
import possibleStandardNames from "../utils/reactPossibleStandardNames";


const possibleHtmlNames = _.invert(possibleStandardNames);
const getPossibleHtmlName = (key) => {
  return possibleHtmlNames[key] || key;
};

export default class ClientHandler extends Tapable {
  historyUnlistener = null;
  routeHandler = null;

  constructor(options) {
    super();

    this.manageHistoryChange = this.manageHistoryChange.bind(this);
    this.history = window.__history = window.__history || createBrowserHistory();
    this.historyUnlistener = this.history.listen(this.manageHistoryChange);

    this.hooks = {
      "locationChange": new AsyncParallelBailHook(["location", "action"]),
      "beforeRender": new AsyncParallelHook(),
      "renderComplete": new SyncHook(),
    };
    this.options = options;
    this.addServiceWorker();
  }

  manageHistoryChange(location, action) {
    this.hooks.locationChange.callAsync(location, action, function () {return null;});
    this.routeHandler && this.updatePageMeta(location);
  }

  updatePageMeta(location) {
    const routes = this.routeHandler.getRoutes();
    const currentRoutes = matchRoutes(routes, location.pathname);
    let promises = [];

    let seoData = {};
    let pwaSchema = this.routeHandler.getPwaSchema();
    let seoSchema = this.routeHandler.getDefaultSeoSchema();
    currentRoutes.forEach(r => {
      if (r.route && r.route.component && r.route.component.preload) {
        promises.push(r.route.component.preload());
      }
    });


    Promise.all(promises).then(() => {
      currentRoutes.forEach(r => {
        seoData = _.assignIn(seoData, r.route.seo, r.route.getRouteSeo());
      });

      const metaTags = generateMeta(seoData, {
        baseUrl: window.location.origin,
        url: window.location.href,
        seoSchema,
        pwaSchema,
      });

      metaTags.forEach(meta => {
        let metaSearchStr = "meta";
        let firstMetaSearchStr = "";
        let htmlMeta = {};

        if(meta.name === "title") {
          document.title = meta.content;
        }

        Object.keys(meta).forEach(key => {
          htmlMeta[getPossibleHtmlName(key)] = meta[key];
          if (!firstMetaSearchStr) {
            firstMetaSearchStr = `meta[${getPossibleHtmlName(key)}=${JSON.stringify(meta[key])}]`;
          }
          metaSearchStr += `[${getPossibleHtmlName(key)}=${JSON.stringify(meta[key])}]`;
        });

        const alreadyExists = document.querySelector(metaSearchStr);
        if (!alreadyExists) {
          const previousExists = document.querySelector(firstMetaSearchStr);
          if (previousExists) {
            previousExists.remove();
          }

          const metaElement = document.createElement("meta");
          Object.keys(htmlMeta).forEach(htmlMetaKey => {
            metaElement.setAttribute(htmlMetaKey, htmlMeta[htmlMetaKey]);
          });
          document.getElementsByTagName("head")[0].appendChild(metaElement);
        }
      });
    });

  }

  addServiceWorker() {
    if (!this.options.env.serviceWorker) return;
    this.hooks.renderComplete.tap("AddServiceWorker", (err) => {
      if (err) return;
      if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
          navigator.serviceWorker.register("/sw.js");
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
    this.routeHandler = routeHandler;
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

          (typeof window.__preloaded_data[i] !== "undefined") &&
          r.route && r.route.component && r.route.component.preload &&
          (promises.push(r.route.component.preload(window.__preloaded_data[i])));
        });
      }

      Promise.all(promises).then(() => {
        // Render according to routes!
        renderer(
          <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
            <Router history={this.history}>
              {renderRoutes(routes)}
            </Router>
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