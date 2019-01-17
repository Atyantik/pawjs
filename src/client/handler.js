import {
  AsyncSeriesHook,
  AsyncParallelBailHook,
  SyncHook,
} from 'tapable';
import _ from 'lodash';
import React from 'react';
import { renderRoutes } from 'react-router-config';
import { Router } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { render, hydrate } from 'react-dom';
import RouteHandler from '../router/handler';
import ErrorBoundary from '../components/ErrorBoundary';
import { generateMeta } from '../utils/seo';
import possibleStandardNames from '../utils/reactPossibleStandardNames';
import PreloadDataManager from '../utils/preloadDataManager';

const possibleHtmlNames = _.invert(possibleStandardNames);
const getPossibleHtmlName = key => possibleHtmlNames[key] || key;

const b64DecodeUnicode = str => decodeURIComponent(
  atob(str)
    .split('')
    .map(c => `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`)
    .join(''),
);

export default class ClientHandler {
  historyUnlistener = null;

  routeHandler = null;

  constructor(options) {
    this.addPlugin = this.addPlugin.bind(this);
    this.manageHistoryChange = this.manageHistoryChange.bind(this);
    this.preloadManager = new PreloadDataManager();

    window.PAW_HISTORY = window.PAW_HISTORY || createBrowserHistory({
      basename: options.env.appRootUrl,
    });
    this.history = window.PAW_HISTORY;
    this.historyUnlistener = this.history.listen(this.manageHistoryChange);

    this.hooks = {
      locationChange: new AsyncParallelBailHook(['location', 'action']),
      beforeLoadData: new AsyncSeriesHook(['setParams', 'getParams']),
      beforeRender: new AsyncSeriesHook(['Application']),
      renderRoutes: new AsyncSeriesHook(['AppRoutes']),
      renderComplete: new SyncHook(),
    };
    this.options = options;
    this.manageServiceWorker();
  }

  manageHistoryChange(location, action) {
    this.hooks.locationChange.callAsync(location, action, () => null);
    if (this.routeHandler) {
      this.updatePageMeta(location).catch((e) => {
        // eslint-disable-next-line
        console.log(e);
      });
    }
  }

  async updatePageMeta(location) {
    const routes = this.routeHandler.getRoutes();
    const currentRoutes = RouteHandler.matchRoutes(routes, location.pathname.replace(this.options.env.appRootUrl, ''));
    const promises = [];

    let seoData = {};
    const pwaSchema = this.routeHandler.getPwaSchema();
    const seoSchema = this.routeHandler.getDefaultSeoSchema();

    currentRoutes.forEach((r) => {
      if (r.route && r.route.component && r.route.component.preload) {
        promises.push(r.route.component.preload(undefined, {
          route: r.route,
          match: r.match,
          ...this.preloadManager.getParams(),
        }));
      }
    });

    await Promise.all(promises).then(() => {
      currentRoutes.forEach((r) => {
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

      metaTags.forEach((meta) => {
        let metaSearchStr = 'meta';
        let firstMetaSearchStr = '';
        const htmlMeta = {};

        if (meta.name === 'title') {
          document.title = meta.content;
        }

        Object.keys(meta).forEach((key) => {
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

          const metaElement = document.createElement('meta');
          Object.keys(htmlMeta).forEach((htmlMetaKey) => {
            metaElement.setAttribute(htmlMetaKey, htmlMeta[htmlMetaKey]);
          });
          document.getElementsByTagName('head')[0].appendChild(metaElement);
        }
      });
    });
  }

  manageServiceWorker() {
    if (this.options.env.serviceWorker) {
      this.hooks.renderComplete.tap('AddServiceWorker', (err) => {
        if (err) return;
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register(`${this.options.env.appRootUrl}/sw.js`).catch(() => null);
        }
      });
    } else {
      // remove previously registered service worker
      this.hooks.renderComplete.tap('RemoveServiceWorker', (err) => {
        if (err) return;
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach(registration => registration.unregister());
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
    } catch (ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    if (plugin.apply) {
      plugin.apply(this);
    }
  }

  async run({ routeHandler }) {
    this.routeHandler = routeHandler;
    const { env } = this.options;
    const root = _.get(env, 'clientRootElementId', 'app');

    if (!document.getElementById(root)) {
      // eslint-disable-next-line
      console.warn(`#${root} element not found in html. thus cannot proceed further`);
      return false;
    }
    const domRootReference = document.getElementById(root);
    const renderer = env.serverSideRender && !env.singlePageApplication ? hydrate : render;

    const routes = routeHandler.getRoutes();

    const currentPageRoutes = RouteHandler.matchRoutes(routes, window.location.pathname.replace(this.options.env.appRootUrl, ''));

    const promises = [];

    if (window.PAW_PRELOADED_DATA) {
      const preloadedData = JSON.parse(b64DecodeUnicode(window.PAW_PRELOADED_DATA));

      // Wait for preload data manager to get executed
      await new Promise(r => this
        .hooks
        .beforeLoadData
        .callAsync(this.preloadManager.setParams, this.preloadManager.getParams, r));

      currentPageRoutes.forEach((r, i) => {
        if (
          (typeof preloadedData[i] !== 'undefined')
          && r.route && r.route.component && r.route.component.preload
        ) {
          promises.push(r.route.component.preload(preloadedData[i], {
            route: r.route,
            match: r.match,
            ...this.preloadManager.getParams(),
          }));
        }
      });
    }

    const AppRouter = (this.options.env.singlePageApplication && this.options.env.hashedRoutes)
      ? HashRouter : Router;

    let RouterParams = {
      history: this.history,
    };
    if (this.options.env.singlePageApplication && this.options.env.hashedRoutes) {
      RouterParams = {};
    }

    const AppRoutes = {
      renderedRoutes: renderRoutes(routes),
      setRenderedRoutes: (r) => {
        AppRoutes.renderedRoutes = r;
      },
      getRenderedRoutes: () => AppRoutes.renderedRoutes,
    };

    await Promise.all(promises).catch();

    await (new Promise(r => this.hooks.renderRoutes.callAsync({
      setRenderedRoutes: AppRoutes.setRenderedRoutes,
      getRenderedRoutes: AppRoutes.getRenderedRoutes,
    }, r)));

    // await this.hooks.renderRoutes.callAsync({
    //   setRenderedRoutes: AppRoutes.setRenderedRoutes,
    //   getRenderedRoutes: AppRoutes.getRenderedRoutes,
    // }, () => null);
    const children = (
      <AppRouter basename={env.appRootUrl} {...RouterParams}>
        {AppRoutes.renderedRoutes}
      </AppRouter>
    );
    const Application = {
      children,
      currentRoutes: currentPageRoutes.slice(0),
      routes: routes.slice(0),
    };

    return new Promise((resolve) => {
      this.hooks.beforeRender.callAsync(Application, async () => {
        // Render according to routes!
        renderer(
          <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
            {Application.children}
          </ErrorBoundary>,
          domRootReference,
          // div,
          () => {
            window.PAW_PRELOADED_DATA = null;
            delete window.PAW_PRELOADED_DATA;
            if (document.getElementById('__pawjs_preloaded')) {
              document.getElementById('__pawjs_preloaded').remove();
            }
            this.hooks.renderComplete.call();
            resolve();
          },
        );
      });
    });
  }
}
