import {
  Tapable,
  AsyncSeriesHook
} from "tapable";

import React from "react";
import _ from "lodash";
import { renderToNodeStream, renderToString } from "react-dom/server";
import Html from "../components/Html";
import {matchRoutes, renderRoutes} from "react-router-config";
import { StaticRouter } from "react-router";
import ErrorBoundary from "../components/ErrorBoundary";
import { generateMeta } from "../utils/seo";

export default class ServerHandler extends Tapable {

  constructor(options) {
    super();
    this.hooks = {
      "html": new AsyncSeriesHook(["props", "request", "response", "currentRoutes", "allRoutes"]),
      "app": new AsyncSeriesHook(["application", "request", "response", "currentRoutes", "allRoutes"])
    };
    this.options = options;
  }

  async run({ routeHandler, req, res, next, assets , cssDependencyMap}) {

    const { asyncCSS, serverSideRender } = this.options.env;

    if (!serverSideRender) {
      res.write("<!DOCTYPE html>");
      renderToNodeStream(
        <Html
          assets={assets}
        />
      ).pipe(res);
      return next();
    }

    let routes = routeHandler.getRoutes();

    let currentPageRoutes = matchRoutes(routes, req.path);

    let context = {};

    let promises = [];
    let preloadedData = [];
    let cssToBeIncluded = [];

    let modulesInRoutes = [];
    if (!asyncCSS) {
      modulesInRoutes = ["./app"];
    }

    const seoSchema = routeHandler.getDefaultSeoSchema();
    const pwaSchema = routeHandler.getPwaSchema();
    let seoData = {};

    currentPageRoutes.forEach(({route}) => {
      !asyncCSS && route.modules && modulesInRoutes.push(...route.modules);
      if (route.component.preload) {
        promises.push(route.component.preload());
      }
    });

    modulesInRoutes.forEach(mod => {
      //eslint-disable-next-line
      cssDependencyMap.forEach(c => {
        if (_.indexOf(c.modules, mod) !== -1) {
          cssToBeIncluded.push(c.path);
        }
      });
    });


    let renderedHtml = "";
    try {
      const promisesData = await Promise.all(promises);

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
        preloadedData: preloadedData,
        metaTags,
        pwaSchema,
        head: [],
        footer: [],
      };

      let Application = {
        children: (
          <StaticRouter location={req.url}  context={context}>
            {renderRoutes(routes)}
          </StaticRouter>
        ),
        context: context
      };

      // Do not send reference of routes but send a copy instead.
      await new Promise (r => this.hooks.app.callAsync(Application, req, res, currentPageRoutes.slice(0), routes.slice(0), r ));

      // Do not send reference of routes but send a copy instead.
      await new Promise (r => this.hooks.html.callAsync(htmlProps, req, res, currentPageRoutes.slice(0), routes.slice(0), r));

      renderedHtml = renderToString(
        <Html
          {...htmlProps}
        >
          <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
            {Application.children}
          </ErrorBoundary>
        </Html>
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
          assets={assets}
          cssFiles={cssToBeIncluded}
          pwaSchema={pwaSchema}
        >
          <ErrorComponent error={ex} />
        </Html>
      );
    }
    res
      .status(context.status || 200)
      .type("html")
      .send(`<!DOCTYPE html>${renderedHtml}`);
  }
}