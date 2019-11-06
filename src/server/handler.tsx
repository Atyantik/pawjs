import {
  AsyncParallelBailHook,
  AsyncSeriesHook, SyncHook,
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
import AbstractPlugin from '../abstract-plugin';

type Options = {
  env: any;
};

export default class ServerHandler extends AbstractPlugin {
  options: Options;

  hooks: {
    beforeStart: AsyncSeriesHook<any>,
    afterStart: AsyncSeriesHook<any>,
    beforeLoadData: AsyncSeriesHook<any>,
    beforeAppRender: AsyncSeriesHook<any>,
    beforeHtmlRender: AsyncSeriesHook<any>,
    renderRoutes: AsyncSeriesHook<any>,
  };

  constructor(options: Options) {
    super();
    this.addPlugin = this.addPlugin.bind(this);
    this.hooks = {
      beforeStart: new AsyncSeriesHook(['config', 'appOptions']),
      afterStart: new AsyncSeriesHook(['appOptions']),
      beforeLoadData: new AsyncSeriesHook(['setParams', 'getParams', 'request', 'response']),
      beforeAppRender: new AsyncSeriesHook(['application', 'request', 'response']),
      beforeHtmlRender: new AsyncSeriesHook(['application', 'request', 'response']),
      renderRoutes: new AsyncSeriesHook(['appRoutes', 'request', 'response']),
    };
    this.options = options;
  }

  async run({
    routeHandler, req, res, next, assets, cssDependencyMap,
  }: any) {
    const {
      asyncCSS,
      serverSideRender,
      appRootUrl,
      noJS,
    } = this.options.env;

    let routes = routeHandler.getRoutes();
    let renderedHtml = '';
    let context:any = {};
    let promises: Promise<any> [] = [];
    const preloadedData: any[] = [];
    const cssToBeIncluded: string[] = [];
    const cssToBePreloaded: string[] = [];
    const modulesInRoutes: string[] = ['pawProjectClient'];

    const seoSchema = routeHandler.getDefaultSeoSchema();
    const pwaSchema = routeHandler.getPwaSchema();
    let currentPageRoutes = RouteHandler.matchRoutes(routes, req.path.replace(appRootUrl, ''));

    if (!serverSideRender) {
      res.status(200).type('text/html');
      res.write('<!DOCTYPE html>');
      modulesInRoutes.forEach((mod) => {
        cssDependencyMap.forEach((c: { modules: string[], path: string }) => {
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
        seoSchema,
        pwaSchema,
        url: fullUrl,
      });

      const htmlProps = {
        assets,
        noJS,
        metaTags,
        pwaSchema,
        cssFiles: cssToBeIncluded,
        preloadCssFiles: cssToBePreloaded.length >= 1,
        head: [],
        footer: [],
        env: _.assignIn({}, this.options.env),
      };

      const application = {
        context,
        htmlProps,
        children: null,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };

      await new Promise(r => this.hooks.beforeHtmlRender.callAsync(application, req, res, r));

      renderedHtml = renderToString(
        // tslint:disable-next-line:jsx-wrap-multiline
        <Html
          assets={htmlProps.assets}
          noJS={htmlProps.noJS}
          metaTags={htmlProps.metaTags}
          pwaSchema={htmlProps.pwaSchema}
          cssFiles={htmlProps.cssFiles}
          preloadCssFiles={htmlProps.preloadCssFiles}
          head={htmlProps.head}
          footer={htmlProps.footer}
          env={htmlProps.env}
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

    currentPageRoutes.forEach(({ route }: { route: { modules: string[] } }) => {
      if (route.modules) {
        modulesInRoutes.push(...route.modules);
      }
    });

    modulesInRoutes.forEach((mod) => {
      cssDependencyMap.forEach((c: { modules: string[], path: string }) => {
        if (_.indexOf(c.modules, mod) !== -1) {
          if (!asyncCSS) {
            cssToBeIncluded.push(c.path);
          } else {
            cssToBePreloaded.push(c.path);
          }
        }
      });
    });

    await new Promise(r => this
      .hooks
      .beforeLoadData
      .callAsync(
        routeHandler.routeCompiler.preloadManager.setParams,
        routeHandler.routeCompiler.preloadManager.getParams,
        req,
        res,
        r,
      ));

    currentPageRoutes.forEach(({ route, match }: any) => {
      if (route.component.preload) {
        promises.push(
          route.component.preload(
            undefined,
            {
              route,
              match,
            },
          ),
        );
      }
    });

    try {
      const promisesData = await Promise.all(promises);
      let seoData = {};
      currentPageRoutes.forEach((r: { route: any, match: any}, i: number) => {
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
        seoSchema,
        pwaSchema,
        url: fullUrl,
      });
      const htmlProps = {
        noJS,
        assets,
        preloadedData,
        metaTags,
        pwaSchema,
        cssFiles: cssToBeIncluded,
        preloadCssFiles: cssToBePreloaded.length >= 1,
        head: [],
        footer: [],
        env: _.assignIn({}, this.options.env),
      };

      const appRoutes = {
        renderedRoutes: renderRoutes(routes),
        setRenderedRoutes: (r: JSX.Element) => {
          appRoutes.renderedRoutes = r;
        },
        getRenderedRoutes: () => appRoutes.renderedRoutes,
      };
      await new Promise(
        r => this.hooks.renderRoutes.callAsync(
          {
            setRenderedRoutes: appRoutes.setRenderedRoutes,
            getRenderedRoutes: appRoutes.getRenderedRoutes,
          },
          req,
          res,
          r,
        ),
      );
      const application = {
        context,
        htmlProps,
        children: (
          <StaticRouter location={req.url} context={context} basename={appRootUrl}>
            {appRoutes.renderedRoutes}
          </StaticRouter>
        ),
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };

      await new Promise(r => this.hooks.beforeAppRender.callAsync(application, req, res, r));

      const htmlContent = this.options.env.singlePageApplication ? '' : renderToString(
        (
          <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
            {application.children}
          </ErrorBoundary>
        ),
      );
      if (context.url) {
        // can use the `context.status` that
        // we added in RedirectWithStatus
        res.redirect(context.status || 301, context.url);
        return next();
      }

      await new Promise(r => this.hooks.beforeHtmlRender.callAsync(application, req, res, r));
      renderedHtml = renderToString(
        (
          <Html
            assets={htmlProps.assets}
            noJS={htmlProps.noJS}
            metaTags={htmlProps.metaTags}
            pwaSchema={htmlProps.pwaSchema}
            cssFiles={htmlProps.cssFiles}
            preloadCssFiles={htmlProps.preloadCssFiles}
            head={htmlProps.head}
            footer={htmlProps.footer}
            env={htmlProps.env}
            appRootUrl={appRootUrl}
            clientRootElementId={this.options.env.clientRootElementId}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ),
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
      context = {};
      promises = [];
      return next();
    } catch (ex) {
      const components = {
        errorComponent: routeHandler.getErrorComponent(),
      };
      renderedHtml = renderToString(
        (
          <Html
            noJS={noJS}
            clientRootElementId={this.options.env.clientRootElementId}
            assets={assets}
            cssFiles={cssToBeIncluded}
            preloadCssFiles={cssToBePreloaded.length >= 1}
            pwaSchema={pwaSchema}
            appRootUrl={appRootUrl}
          >
            <components.errorComponent error={ex} />
          </Html>
        ),
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
