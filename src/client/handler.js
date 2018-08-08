import {
  Tapable,
  AsyncSeriesHook,
  AsyncParallelBailHook,
  SyncHook,
} from "tapable";
import _ from "lodash";
import React from "react";
import { renderRoutes, matchRoutes } from "react-router-config";
import { Router } from "react-router";
import { HashRouter } from "react-router-dom";
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

    this.addPlugin = this.addPlugin.bind(this);
    this.manageHistoryChange = this.manageHistoryChange.bind(this);

    this.history = window.__history = window.__history || createBrowserHistory({
      basename: options.env.appRootUrl,
    });
    this.historyUnlistener = this.history.listen(this.manageHistoryChange);

    this.hooks = {
      "locationChange": new AsyncParallelBailHook(["location", "action"]),
      "beforeRender": new AsyncSeriesHook(["Application"]),
      "renderComplete": new SyncHook(),
    };
    this.options = options;
    this.manageServiceWorker();
  }

  manageHistoryChange(location, action) {
    this.hooks.locationChange.callAsync(location, action, function () {return null;});
    this.routeHandler && this.updatePageMeta(location);
  }

  updatePageMeta(location) {
    const routes = this.routeHandler.getRoutes();
    const currentRoutes = matchRoutes(routes, location.pathname.replace(this.options.env.appRootUrl, ""));
    let promises = [];

    let seoData = {};
    let pwaSchema = this.routeHandler.getPwaSchema();
    let seoSchema = this.routeHandler.getDefaultSeoSchema();
    currentRoutes.forEach(r => {
      if (r.route && r.route.component && r.route.component.preload) {
        promises.push(r.route.component.preload(undefined, {
          route: r.route,
          match: r.match,
        }));
      }
    });


    Promise.all(promises).then(() => {
      currentRoutes.forEach(r => {
        let routeSeo = {};
        if (r.route.getRouteSeo) {
          routeSeo = r.route.getRouteSeo();
        }
        seoData = _.assignIn(seoData, r.route.seo, routeSeo);
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

  manageServiceWorker() {
    if (this.options.env.serviceWorker) {
      this.hooks.renderComplete.tap("AddServiceWorker", (err) => {
        if (err) return;
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.register(`${this.options.env.appRootUrl}/sw.js`);
        }
      });
    } else {
      // remove previously registered service worker
      this.hooks.renderComplete.tap("RemoveServiceWorker", (err) => {
        if (err) return;
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for(let registration of registrations) {
              registration.unregister();
            }
          });
        }
      });
    }
    
  }

  addPlugin(plugin) {
    try {
      if (plugin.hooks && Object.keys(plugin.hooks).length) {
        _.each(plugin.hooks, (hookValue, hookName) => {
          this.hooks[hookName] = hookValue;
        });
      }
    } catch(ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    plugin.apply && plugin.apply(this);
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
    const renderer = env.serverSideRender && !env.singlePageApplication? hydrate: render;

    const routes = routeHandler.getRoutes();

    let currentPageRoutes = matchRoutes(routes, location.pathname.replace(this.options.env.appRootUrl, ""));

    let promises = [];

    if (window.__preloaded_data) {
      const preloadedData = JSON.parse(atob(window.__preloaded_data));
      currentPageRoutes.forEach((r,i) => {
        (typeof preloadedData[i] !== "undefined") &&
        r.route && r.route.component && r.route.component.preload &&
        (promises.push(r.route.component.preload(preloadedData[i], {
          route: r.route,
          match: r.match
        })));
      });
    }
    
    let AppRouter = (this.options.env.singlePageApplication && this.options.env.hashedRoutes)? HashRouter: Router;
    
    let RouterParams = {
      history: this.history
    };
    if (this.options.env.singlePageApplication) {
      RouterParams = {};
    }

    Promise.all(promises).then(() => {
      let children = (
        <AppRouter basename={env.appRootUrl} {...RouterParams}>
          {renderRoutes(routes)}
        </AppRouter>
      );
      let Application = {
        children,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };

      this.hooks.beforeRender.callAsync(Application, () => {
        // Render according to routes!
        renderer(
          <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
            {Application.children}
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