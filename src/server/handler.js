import {
  AsyncSeriesHook,
} from 'tapable';

import React from 'react';
import _ from 'lodash';
import { renderToString } from 'react-dom/server';
import { renderRoutes } from 'react-router-config';
import { StaticRouter } from 'react-router';
import RouteHandler from '../router/handler';
import Html from '../components/Html';
import ErrorBoundary from '../components/ErrorBoundary';
import { generateMeta } from '../utils/seo';
import PreloadDataManager from '../utils/preloadDataManager';

export default class ServerHandler {
  constructor(options) {
    this.addPlugin = this.addPlugin.bind(this);
    this.hooks = {
      beforeStart: new AsyncSeriesHook(['config', 'appOptions']),
      afterStart: new AsyncSeriesHook(['appOptions']),
      beforeLoadData: new AsyncSeriesHook(['setParams', 'getParams', 'request', 'response']),
      beforeAppRender: new AsyncSeriesHook(['application', 'request', 'response']),
      beforeHtmlRender: new AsyncSeriesHook(['application', 'request', 'response']),
      renderRoutes: new AsyncSeriesHook(['appRoutes']),
    };
    this.options = options;
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

  async run({
    routeHandler, req, res, next, assets, cssDependencyMap,
  }) {
    const { asyncCSS, serverSideRender, appRootUrl } = this.options.env;

    let routes = routeHandler.getRoutes();
    let renderedHtml = '';
    let context = {};
    let promises = [];
    const preloadedData = [];
    const cssToBeIncluded = [];
    const cssToBePreloaded = [];
    const modulesInRoutes = ['pawProjectClient'];

    const seoSchema = routeHandler.getDefaultSeoSchema();
    const pwaSchema = routeHandler.getPwaSchema();
    let currentPageRoutes = RouteHandler.matchRoutes(routes, req.path.replace(appRootUrl, ''));

    if (!serverSideRender) {
      res.status(200).type('text/html');
      res.write('<!DOCTYPE html>');
      modulesInRoutes.forEach((mod) => {
        cssDependencyMap.forEach((c) => {
          if (_.indexOf(c.modules, mod) !== -1) {
            if (!asyncCSS) {
              cssToBeIncluded.push(c.path);
            } else {
              cssToBePreloaded.push(c.path);
            }
          }
        });
      });
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fullUrl = `${baseUrl}${req.originalUrl}`;

      const metaTags = generateMeta({}, {
        baseUrl,
        url: fullUrl,
        seoSchema,
        pwaSchema,
      });

      const htmlProps = {
        assets,
        cssFiles: cssToBeIncluded,
        preloadCssFiles: cssToBePreloaded.length >= 1,
        metaTags,
        pwaSchema,
        head: [],
        footer: [],
        env: _.assignIn({}, this.options.env),
      };

      const Application = {
        htmlProps,
        children: null,
        context,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };

      await new Promise(r => this.hooks.beforeHtmlRender.callAsync(Application, req, res, r));

      renderedHtml = renderToString(
        <Html
          {...htmlProps}
          appRootUrl={appRootUrl}
          clientRootElementId={this.options.env.clientRootElementId}
        />,
      );
      renderedHtml = renderedHtml.replace(
        '<preload-css></preload-css>',
        cssToBePreloaded.map(
          p => `<link rel="preload" href="${p}" as="style" onerror="this.rel='stylesheet'" onload="this.rel='stylesheet'"/>`,
        ).join(''),
      );

      res.write(renderedHtml);
      res.end();
      return next();
    }

    currentPageRoutes.forEach(({ route }) => {
      if (route.modules) {
        modulesInRoutes.push(...route.modules);
      }
    });

    modulesInRoutes.forEach((mod) => {
      cssDependencyMap.forEach((c) => {
        if (_.indexOf(c.modules, mod) !== -1) {
          if (!asyncCSS) {
            cssToBeIncluded.push(c.path);
          } else {
            cssToBePreloaded.push(c.path);
          }
        }
      });
    });

    const preloadManager = new PreloadDataManager();

    await new Promise(r => this
      .hooks
      .beforeLoadData
      .callAsync(preloadManager.setParams, preloadManager.getParams, req, res, r));

    currentPageRoutes.forEach(({ route, match }) => {
      if (route.component.preload) {
        promises.push(
          route.component.preload(
            undefined,
            {
              route,
              match,
              ...preloadManager.getParams(),
            },
          ),
        );
      }
    });

    try {
      const promisesData = await Promise.all(promises);
      let seoData = {};
      currentPageRoutes.forEach((r, i) => {
        if (r.route.getRouteSeo) {
          seoData = _.assignIn(seoData, r.route.seo, r.route.getRouteSeo());
        }
        if (promisesData[i]) {
          preloadedData.push(promisesData[i][1]);
        }
      });
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const fullUrl = `${baseUrl}${req.originalUrl}`;
      const metaTags = generateMeta(seoData, {
        baseUrl,
        url: fullUrl,
        seoSchema,
        pwaSchema,
      });
      const htmlProps = {
        assets,
        cssFiles: cssToBeIncluded,
        preloadCssFiles: cssToBePreloaded.length >= 1,
        preloadedData,
        metaTags,
        pwaSchema,
        head: [],
        footer: [],
        env: _.assignIn({}, this.options.env),
      };

      const AppRoutes = {
        renderedRoutes: renderRoutes(routes),
        setRenderedRoutes: (r) => {
          AppRoutes.renderedRoutes = r;
        },
        getRenderedRoutes: () => AppRoutes.renderedRoutes,
      };
      await new Promise(r => this.hooks.renderRoutes.callAsync({
        setRenderedRoutes: AppRoutes.setRenderedRoutes,
        getRenderedRoutes: AppRoutes.getRenderedRoutes,
      }, r));
      const Application = {
        htmlProps,
        children: (
          <StaticRouter location={req.url} context={context} basename={appRootUrl}>
            {AppRoutes.renderedRoutes}
          </StaticRouter>
        ),
        context,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };

      await new Promise(r => this.hooks.beforeAppRender.callAsync(Application, req, res, r));

      const htmlContent = this.options.env.singlePageApplication ? '' : renderToString(
        <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
          {Application.children}
        </ErrorBoundary>,
      );
      if (context.url) {
        // can use the `context.status` that
        // we added in RedirectWithStatus
        res.redirect(context.status || 301, context.url);
        return next();
      }

      await new Promise(r => this.hooks.beforeHtmlRender.callAsync(Application, req, res, r));
      renderedHtml = renderToString(
        <Html
          {...Application.htmlProps}
          appRootUrl={appRootUrl}
          clientRootElementId={this.options.env.clientRootElementId}
          dangerouslySetInnerHTML={{
            __html: htmlContent,
          }}
        />,
      );

      renderedHtml = renderedHtml.replace(
        '<preload-css></preload-css>',
        cssToBePreloaded.map(
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`,
        ).join(''),
      );

      res
        .status(context.status || 200)
        .type('text/html')
        .send(`<!DOCTYPE html>${renderedHtml}`);

      // Free some memory
      routes = null;
      currentPageRoutes = null;
      context = null;
      promises = null;
      return next();
    } catch (ex) {
      const ErrorComponent = routeHandler.getErrorComponent();
      renderedHtml = renderToString(
        <Html
          clientRootElementId={this.options.env.clientRootElementId}
          assets={assets}
          cssFiles={cssToBeIncluded}
          preloadCssFiles={cssToBePreloaded.length >= 1}
          pwaSchema={pwaSchema}
        >
          <ErrorComponent error={ex} />
        </Html>,
      );

      renderedHtml = renderedHtml.replace(
        '<preload-css></preload-css>',
        cssToBePreloaded.map(
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`,
        ).join(''),
      );
    }
    return res
      .status(context.status || 200)
      .type('text/html')
      .send(`<!DOCTYPE html>${renderedHtml}`);
  }
}
