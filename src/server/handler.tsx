import {
  Hook,
  AsyncSeriesHook,
} from 'tapable';
import express from 'express';
import { createPath, To } from 'history';
import _ from 'lodash';
import { renderToString, renderToNodeStream } from 'react-dom/server';
import { Routes, Route, Outlet } from 'react-router-dom';
import { StaticRouter } from 'react-router-dom/server';
import RouteHandler from '../router/handler';
import Html from '../components/Html';
import ErrorBoundary from '../components/ErrorBoundary';
import { generateMeta } from '../utils/seo';
import AbstractPlugin from '../abstract-plugin';
import { CompiledRoute } from '../@types/route';
import NotFoundError from '../errors/not-found';
import RedirectError from '../errors/redirect';
import { PawProvider } from '../components/Paw';

const createHref = (to: To) => {
  return typeof to === 'string' ? to : createPath(to);
};

type Options = {
  env: any;
  expressApp?: express.Application,
};
type DependencyMapItem = { modules: string[], path: string };

type RenderHtmlType<T> =
  T extends true ? ReturnType<typeof renderToNodeStream> :
    T extends false ? ReturnType<typeof renderToString> :
      never;
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
    requestStart: AsyncSeriesHook<any>,
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
      requestStart: new AsyncSeriesHook(['request', 'response']),
      beforeLoadData: new AsyncSeriesHook(['setParams', 'getParams', 'request', 'response']),
      beforeAppRender: new AsyncSeriesHook(['application', 'request', 'response']),
      beforeHtmlRender: new AsyncSeriesHook(['application', 'request', 'response']),
      renderRoutes: new AsyncSeriesHook(['appRoutes', 'request', 'response']),
    };
    this.options = options;
  }

  getBaseRequestUrl(req: express.Request) {
    try {
      const host = req.get('X-Host') || req.get('X-Forwarded-Host') || req.get('host');
      const protocol = req.protocol
        || req.get('X-Forwarded-Protocol')
        || req.get('X-Forwarded-Proto')
        || (req.secure ? 'https' : 'http');
      return `${protocol}://${host}`;
    } catch (ex) {
      return `${req.protocol}://${req.get('host')}`;
      // Some error with parsing of url
    }
  }

  getFullRequestUrl(req: express.Request) {
    try {
      const baseUrl = this.getBaseRequestUrl(req);
      const parsedUrl = new URL(req.originalUrl, baseUrl);

      let pathName = '/';
      if (parsedUrl.pathname) {
        pathName = parsedUrl.pathname;
        if (!pathName.endsWith('/')) {
          pathName += '/';
        }
      }
      return `${baseUrl}${pathName}${parsedUrl.search || ''}`;
    } catch (ex) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      return `${baseUrl}${req.originalUrl}`;
      // Some error with parsing of url
    }
  }

  getModuleCSS(
    modules: string[],
  ) {
    const dependencyMap = this.options?.expressApp?.locals?.cssDependencyMap ?? [];
    const moduleCss: string [] = [];
    modules.forEach((mod) => {
      dependencyMap.forEach((c: DependencyMapItem) => {
        if (_.indexOf(c.modules, mod) !== -1) {
          moduleCss.push(c.path);
        }
      });
    });
    return moduleCss;
  }

  /**
   * Render HTML with given parameters
   * @param app
   * @param req
   * @param res
   * @param htmlContent
   * @param stream
   * @returns
   */
  async renderHtml(
    app: IApplication,
    req: express.Request,
    res: express.Response,
    htmlContent?: string,
    stream: boolean = false,
  ): Promise<RenderHtmlType<typeof stream>> {
    await new Promise(r => this.hooks.beforeHtmlRender.callAsync(app, req, res, r));
    const content = app.htmlProps.htmlContent ? app.htmlProps.htmlContent : htmlContent;
    const renderer = stream ? renderToNodeStream : renderToString;
    return renderer(
      (
        <Html
          assets={app.htmlProps.assets}
          metaTags={app.htmlProps.metaTags}
          pwaSchema={app.htmlProps.pwaSchema}
          preloadedData={app.htmlProps.preloadedData}
          cssFiles={app.htmlProps.cssFiles}
          head={app.htmlProps.head}
          footer={app.htmlProps.footer}
          appRootUrl={app.appRootUrl || (app.htmlProps.env && app.htmlProps.env.appRootUrl) || ''}
          clientRootElementId={this.options.env.clientRootElementId}
          dangerouslySetInnerHTML={(content ? { __html: content } : { __html: '' })}
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
    }: { routeHandler: RouteHandler, req: express.Request, res: express.Response, next: express.NextFunction },
  ) {
    /**
     * Get assets from cached app locals
     */
    const assets = (this.options.expressApp?.locals?.assets ?? []) || [];
    const {
      serverSideRender,
      appRootUrl,
    } = this.options.env;
    this.routeHandler = routeHandler;

    /**
     * Hook at the start of request execution
     */
    await new Promise(r => this
      .hooks
      .requestStart
      .callAsync(
        req,
        res,
        r,
      ));

    // @todo Route handler computation and requests can be improved
    // We can optimize it for one time load only.
    let routes = routeHandler.getRoutes();
    const pwaSchema = routeHandler.getPwaSchema();
    const seoSchema = routeHandler.getDefaultSeoSchema();
    let renderedHtml = '';
    let context: any = {};
    let promises: Promise<any> [] = [];
    const preloadedData: any[] = [];
    const modulesInRoutes: string[] = ['pawProjectClient'];
    const baseUrl = this.getBaseRequestUrl(req);
    const fullUrl = this.getFullRequestUrl(req);
    res.locals.fullUrl = fullUrl;
    let metaTags = generateMeta({}, {
      baseUrl,
      seoSchema,
      pwaSchema,
      url: fullUrl,
    });
    const modCss = this.getModuleCSS(modulesInRoutes);
    let htmlProps: any = {
      assets,
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
      const renderedHtmlStream = await this.renderHtml(application, req, res, '', true) as ReturnType<typeof renderToNodeStream>;
      return renderedHtmlStream.pipe(res);
    }

    currentPageRoutes.forEach(({ route }: { route: { modules: string[] } }) => {
      if (route.modules) {
        modulesInRoutes.push(...route.modules);
      }
    });

    const cssToBeIncluded = this.getModuleCSS(modulesInRoutes);

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

    try {
      // Call preload for each element
      currentPageRoutes.forEach(({ route, match }: any) => {
        if (route.element.preload) {
          promises.push(
            route.element.preload(
              undefined,
              {
                route,
                match,
              },
            ).promise,
          );
        }
      });

      const promisesData = await Promise.all(promises);
      let seoData = {};
      currentPageRoutes.forEach((r: { route: any, match: any }, i: number) => {
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
        assets,
        preloadedData,
        metaTags,
        pwaSchema,
        cssFiles: cssToBeIncluded,
        head: [],
        footer: [],
      };

      const renderRoutes = (routesToRender: any, level = 0) => {
        return routesToRender.map((r: any, index: number) => {
          const { element: ElementComponent, ...others } = r;
          if (!r.children) {
            return (
              <Route element={<ElementComponent />} key={`${level}_${index}`} {...others} />
            );
          }
          return (
            <Route element={<ElementComponent />} key={`${level}_${index}`} {...others}>
              {renderRoutes(r.children, level + 1)}
            </Route>
          );
        });
      };

      const appRoutes = {
        renderedRoutes: (
          <>
            <Routes>
              {renderRoutes(routes)}
            </Routes>
            <Outlet />
          </>
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
        children: appRoutes.renderedRoutes,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };

      await new Promise(r => this.hooks.beforeAppRender.callAsync(application, req, res, r));

      let htmlContent = this.options.env.singlePageApplication ? '' : renderToString(
        (
          <StaticRouter location={req.url} basename={appRootUrl}>
            <PawProvider staticContext={application.context}>
              <ErrorBoundary
                NotFoundComponent={routeHandler.get404Component()}
                ErrorComponent={routeHandler.getErrorComponent()}
              >
                {application.children}
              </ErrorBoundary>
            </PawProvider>
          </StaticRouter>
        ),
      );
      console.log(context);

      const redirectUrl = createHref(context.redirect?.to ?? '');
      if (redirectUrl) {
        // can use the `context.status` that
        // we added in RedirectWithStatus
        res.redirect(context?.statusCode ?? 302, redirectUrl);
        return next();
      }
      renderedHtml = await this.renderHtml(application, req, res, htmlContent) as string;
      res.status(context.statusCode ?? 200).type('text/html');
      res.write('<!DOCTYPE html>');
      res.write(renderedHtml);
      res.end();

      // Free some memory
      routes = null as any;
      currentPageRoutes = null;
      context = {};
      promises = [];
      return next();
    } catch (ex: any) {
      // eslint-disable-next-line no-console
      console.warn(ex);
      if (ex instanceof RedirectError && ex.getRedirect()) {
        return res.redirect(ex.getStatusCode() || 302, createHref(ex.getRedirect()));
      }
      let components = {
        errorComponent: routeHandler.getErrorComponent(),
      };
      if (ex instanceof NotFoundError) {
        components = {
          errorComponent: routeHandler.get404Component(),
        };
      }
      const application = {
        children: (
          <StaticRouter location={req.url} basename={appRootUrl}>
            <PawProvider>
              <components.errorComponent error={ex} />
            </PawProvider>
          </StaticRouter>
        ),
      };
      res.status(context.statusCode ?? ex.code ?? 500).type('text/html');
      res.write('<!DOCTYPE html>');
      renderedHtml = renderToString(
        (
          <Html
            clientRootElementId={this.options.env.clientRootElementId}
            assets={assets}
            cssFiles={cssToBeIncluded}
            pwaSchema={htmlProps.pwaSchema}
            appRootUrl={appRootUrl}
            metaTags={htmlProps.metaTags}
            serverError={application.children}
          />
        ),
      );
      res.write(renderedHtml);
      res.end();
      return next();
    }
  }
}
