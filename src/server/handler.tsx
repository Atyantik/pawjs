import {
  Hook,
  AsyncSeriesHook,
} from 'tapable';
import express from 'express';
import React from 'react';
import _ from 'lodash';
import { renderToString } from 'react-dom/server';
import { renderRoutes } from 'react-router-config';
import { StaticRouter, Route } from 'react-router';
import RouteHandler from '../router/handler';
import Html from '../components/Html';
import ErrorBoundary from '../components/ErrorBoundary';
import { generateMeta } from '../utils/seo';
import AbstractPlugin from '../abstract-plugin';
import { CompiledRoute } from '../@types/route';
import NotFoundError from '../errors/not-found';

type Options = {
  env: any;
};
type dependencyMapItem = { modules: string[], path: string };

interface IApplication {
  context: any;
  htmlProps: any;
  children: null | JSX.Element;
  currentRoutes: CompiledRoute [];
  routes: CompiledRoute [];
  appRootUrl?: string;
}

export default class ServerHandler extends AbstractPlugin {
  options: Options;

  routeHandler: RouteHandler | undefined;

  hooks: {
    beforeStart: AsyncSeriesHook<any>,
    afterStart: AsyncSeriesHook<any>,
    beforeLoadData: AsyncSeriesHook<any>,
    beforeAppRender: AsyncSeriesHook<any>,
    beforeHtmlRender: AsyncSeriesHook<any>,
    renderRoutes: AsyncSeriesHook<any>,
    [s: string]: Hook<any, any> | AsyncSeriesHook<any>,
  };

  constructor(options: Options) {
    super();
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

  // eslint-disable-next-line class-methods-use-this
  getModuleCSS(
    modules: string[],
    dependencyMap: dependencyMapItem[],
  ) {
    const moduleCss: string [] = [];
    modules.forEach((mod) => {
      dependencyMap.forEach((c: dependencyMapItem) => {
        if (_.indexOf(c.modules, mod) !== -1) {
          moduleCss.push(c.path);
        }
      });
    });
    return moduleCss;
  }

  async renderHtml(
    app: IApplication,
    req: express.Request,
    res: express.Response,
    htmlContent?: string,
  ) {
    await new Promise(r => this.hooks.beforeHtmlRender.callAsync(app, req, res, r));
    return renderToString(
      (
        <Html
          assets={app.htmlProps.assets}
          noJS={app.htmlProps.noJS}
          metaTags={app.htmlProps.metaTags}
          pwaSchema={app.htmlProps.pwaSchema}
          preloadedData={app.htmlProps.preloadedData}
          cssFiles={app.htmlProps.cssFiles}
          jsToBePreloaded={app.htmlProps.jsToBePreloaded}
          head={app.htmlProps.head}
          footer={app.htmlProps.footer}
          env={app.htmlProps.env}
          appRootUrl={app.appRootUrl || ''}
          clientRootElementId={this.options.env.clientRootElementId}
          dangerouslySetInnerHTML={(htmlContent ? { __html: htmlContent } : { __html: '' })}
        />
      ),
    );
  }

  async run(
    {
      routeHandler,
      req,
      res,
      next,
      assets,
      cssDependencyMap,
      jsDependencyMap,
    }: any,
  ) {
    const {
      serverSideRender,
      appRootUrl,
      noJS,
    } = this.options.env;
    this.routeHandler = routeHandler;

    let routes = routeHandler.getRoutes();
    const pwaSchema = routeHandler.getPwaSchema();
    const seoSchema = routeHandler.getDefaultSeoSchema();
    let renderedHtml = '';
    let context:any = {};
    let promises: Promise<any> [] = [];
    const preloadedData: any[] = [];
    const jsToBePreloaded: string[] = [];
    const modulesInRoutes: string[] = ['pawProjectClient'];
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fullUrl = `${baseUrl}${req.originalUrl}`;
    let metaTags = generateMeta({}, {
      baseUrl,
      seoSchema,
      pwaSchema,
      url: fullUrl,
    });
    const modCss = this.getModuleCSS(modulesInRoutes, cssDependencyMap);
    let htmlProps: any = {
      assets,
      noJS,
      metaTags,
      pwaSchema,
      cssFiles: modCss,
      head: [],
      footer: [],
      env: _.assignIn({}, this.options.env),
    };

    let currentPageRoutes = RouteHandler.matchRoutes(routes, req.path.replace(appRootUrl, ''));
    if (!serverSideRender) {
      res.status(200).type('text/html');
      res.write('<!DOCTYPE html>');
      const application: IApplication = {
        context,
        htmlProps,
        children: null,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };
      renderedHtml = await this.renderHtml(application, req, res);
      renderedHtml = renderedHtml.replace(
        '<preload-css></preload-css>',
        modCss.map(
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

    const cssToBeIncluded = this.getModuleCSS(modulesInRoutes, cssDependencyMap);

    modulesInRoutes.forEach((mod) => {
      jsDependencyMap.forEach((c: { modules: string[], path: string }) => {
        if (_.indexOf(c.modules, mod) !== -1 && _.indexOf(assets, c.path) === -1) {
          jsToBePreloaded.push(c.path);
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
          ).promise,
        );
      }
    });

    try {
      const promisesData = await Promise.all(promises);
      let seoData = {};
      currentPageRoutes.forEach((r: { route: any, match: any}, i: number) => {
        seoData = { ...seoData, ...r.route.getRouteSeo() };
        if (promisesData[i]) {
          preloadedData.push(promisesData[i][1]);
        }
      });
      metaTags = generateMeta(seoData, {
        baseUrl,
        seoSchema,
        pwaSchema,
        url: fullUrl,
      });

      htmlProps = {
        noJS,
        assets,
        preloadedData,
        metaTags,
        pwaSchema,
        jsToBePreloaded,
        cssFiles: cssToBeIncluded,
        head: [],
        footer: [],
        env: { ...this.options.env },
      };

      const appRoutes = {
        renderedRoutes: (
          <ErrorBoundary
            ErrorComponent={routeHandler.getErrorComponent()}
            NotFoundComponent={routeHandler.get404Component()}
          >
            {renderRoutes(routes)}
          </ErrorBoundary>
        ),
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

      let htmlContent = this.options.env.singlePageApplication ? '' : renderToString(
        (
          <ErrorBoundary>
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
      if (context.status < 200 || context.status >= 300) {
        htmlContent = '';
      }
      renderedHtml = await this.renderHtml(application, req, res, htmlContent);
      res.status(context.status || 200).type('text/html');
      res.write('<!DOCTYPE html>');
      renderedHtml = renderedHtml.replace(
        '<preload-css></preload-css>',
        cssToBeIncluded.map(
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`,
        ).join(''),
      );
      res.write(renderedHtml);
      res.end();

      // Free some memory
      routes = null;
      currentPageRoutes = null;
      context = {};
      promises = [];
      return next();
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.warn(ex);
      let components = {
        errorComponent: routeHandler.getErrorComponent(),
      };
      if (ex instanceof NotFoundError) {
        components = {
          errorComponent: routeHandler.get404Component(),
        };
      }
      res.status(context.status || ex.code || 500).type('text/html');
      res.write('<!DOCTYPE html>');
      const errorComponent = () => <components.errorComponent error={ex} info={ex.stack} />;
      renderedHtml = renderToString(
        (
          <Html
            noJS={noJS}
            clientRootElementId={this.options.env.clientRootElementId}
            assets={assets}
            cssFiles={cssToBeIncluded}
            pwaSchema={htmlProps.pwaSchema}
            appRootUrl={appRootUrl}
            env={{ ...this.options.env }}
            metaTags={htmlProps.metaTags}
          >
            {/* tslint:disable-next-line:jsx-no-multiline-js */}
            {noJS && (
              <ErrorBoundary>
                <StaticRouter location={req.url} context={context} basename={appRootUrl}>
                  <ErrorBoundary
                    ErrorComponent={routeHandler.getErrorComponent()}
                    NotFoundComponent={routeHandler.get404Component()}
                    error={ex}
                  >
                    <Route path="*" component={errorComponent} />
                  </ErrorBoundary>
                </StaticRouter>
              </ErrorBoundary>
            )}

          </Html>
        ),
      );
      renderedHtml = renderedHtml.replace(
        '<preload-css></preload-css>',
        cssToBeIncluded.map(
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`,
        ).join(''),
      );
      res.write(renderedHtml);
      res.end();
      return next();
    }
  }
}
