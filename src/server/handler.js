import {
  Tapable,
  AsyncSeriesHook
} from "tapable";

import React from "react";
import _ from "lodash";
import { renderToString } from "react-dom/server";
import Html from "../components/Html";
import {matchRoutes, renderRoutes} from "react-router-config";
import { StaticRouter } from "react-router";
import ErrorBoundary from "../components/ErrorBoundary";
import { generateMeta } from "../utils/seo";

export default class ServerHandler extends Tapable {
  
  constructor(options) {
    super();
    this.addPlugin = this.addPlugin.bind(this);
    this.hooks = {
      "beforeStart": new AsyncSeriesHook(["config", "appOptions"]),
      "afterStart": new AsyncSeriesHook(["appOptions"]),
      "beforeAppRender": new AsyncSeriesHook(["application", "request", "response"]),
      "beforeHtmlRender": new AsyncSeriesHook(["application", "request", "response"])
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
    } catch(ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
    plugin.apply && plugin.apply(this);
  }
  
  async run({ routeHandler, req, res, next, assets , cssDependencyMap}) {
    
    const { asyncCSS, serverSideRender, appRootUrl } = this.options.env;
    
    let routes = routeHandler.getRoutes();
    let currentPageRoutes = matchRoutes(routes, req.path.replace(appRootUrl, ""));
    let renderedHtml = "";
    let context = {};
    let promises = [];
    let preloadedData = [];
    let cssToBeIncluded = [];
    let cssToBePreloaded = [];
    let modulesInRoutes = [ "pawProjectClient" ];
    
    
    const seoSchema = routeHandler.getDefaultSeoSchema();
    const pwaSchema = routeHandler.getPwaSchema();
  
    currentPageRoutes.forEach(({route}) => {
      route.modules && modulesInRoutes.push(...route.modules);
    });
    
    modulesInRoutes.forEach(mod => {
      cssDependencyMap.forEach(c => {
        if (_.indexOf(c.modules, mod) !== -1) {
          if (!asyncCSS) {
            cssToBeIncluded.push(c.path);
          } else {
            cssToBePreloaded.push(c.path);
          }
        }
      });
    });
    
    if (!serverSideRender) {
      
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fullUrl = `${baseUrl}${req.originalUrl}`;
      
      const metaTags = generateMeta({}, {
        baseUrl,
        url: fullUrl,
        seoSchema,
        pwaSchema,
      });
      
      let htmlProps = {
        assets,
        cssFiles: cssToBeIncluded,
        preloadCssFiles: cssToBePreloaded,
        metaTags,
        pwaSchema,
      };
      
      renderedHtml = renderToString(
        <Html
          {...htmlProps}
          appRootUrl={appRootUrl}
          clientRootElementId={this.options.env.clientRootElementId}
        />
      );
      renderedHtml = renderedHtml.replace (
        "<preload-css></preload-css>",
        cssToBePreloaded.map (
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`
        ).join("")
      );
      
      res
        .status(context.status || 200)
        .type("html")
        .send(`<!DOCTYPE html>${renderedHtml}`);
      return next();
    }
    
    currentPageRoutes.forEach(({route, match}) => {
      if (route.component.preload) {
        promises.push(route.component.preload(undefined, {route, match}));
      }
    });
    
    try {
      const promisesData = await Promise.all(promises);
      let seoData = {};
      currentPageRoutes.forEach((r,i) => {
        if (r.route.getRouteSeo) {
          seoData = _.assignIn(seoData, r.route.seo, r.route.getRouteSeo());
        }
        promisesData[i] && preloadedData.push(promisesData[i][1]);
      });
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fullUrl = `${baseUrl}${req.originalUrl}`;
      const metaTags = generateMeta(seoData, {
        baseUrl,
        url: fullUrl,
        seoSchema,
        pwaSchema,
      });
      let htmlProps = {
        assets,
        cssFiles: cssToBeIncluded,
        preloadCssFiles: cssToBePreloaded,
        preloadedData: preloadedData,
        metaTags,
        pwaSchema,
        head: [],
        footer: [],
      };
      
      let Application = {
        htmlProps,
        children: (
          <StaticRouter location={req.url} context={context} basename={appRootUrl}>
            {renderRoutes(routes)}
          </StaticRouter>
        ),
        context: context,
        currentRoutes: currentPageRoutes.slice(0),
        routes: routes.slice(0),
      };
      
      await new Promise (r => this.hooks.beforeAppRender.callAsync(Application, req, res, r));
      
      let htmlContent = this.options.env.singlePageApplication ? "" : renderToString(
        <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
          {Application.children}
        </ErrorBoundary>
      );
      
      await new Promise (r => this.hooks.beforeHtmlRender.callAsync(Application, req, res, r ));
      
      renderedHtml = renderToString(
        <Html
          {...Application.htmlProps}
          appRootUrl={appRootUrl}
          clientRootElementId={this.options.env.clientRootElementId}
          dangerouslySetInnerHTML={{
            __html: htmlContent,
          }}
        />
      );
      
      renderedHtml = renderedHtml.replace (
        "<preload-css></preload-css>",
        cssToBePreloaded.map (
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`
        ).join("")
      );
      
      if (context.url) {
        // can use the `context.status` that
        // we added in RedirectWithStatus
        res.redirect(context.status || 301, context.url);
      } else {
        res
          .status(context.status || 200)
          .type("html")
          .send(`<!DOCTYPE html>${renderedHtml}`);
      }
      
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
          preloadCssFiles={cssToBePreloaded}
          pwaSchema={pwaSchema}
        >
          <ErrorComponent error={ex} />
        </Html>
      );
      
      renderedHtml = renderedHtml.replace (
        "<preload-css></preload-css>",
        cssToBePreloaded.map (
          p => `<link rel="preload" href="${p}" as="style" onload="this.rel='stylesheet'"/>`
        ).join("")
      );
    }
    
    res
      .status(context.status || 200)
      .type("html")
      .send(`<!DOCTYPE html>${renderedHtml}`);
  }
}