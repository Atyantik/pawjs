import {
  Tapable,
  AsyncParallelHook,
  SyncHook
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
      "clientBeforeRender": new AsyncParallelHook(),
      "clientRenderComplete": new SyncHook(),
    };
    this.options = options;
  }

  run({ routeHandler, req, res, next, assets , cssDependencyMap}) {

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

    Promise.all(promises).then(args => {
      currentPageRoutes.forEach((r,i) => {
        if (!r.route.getRouteSeo) return;
        seoData = _.assignIn(seoData, r.route.seo, r.route.getRouteSeo());
        args[i] && preloadedData.push(args[i][1]);
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const fullUrl = `${baseUrl}${req.originalUrl}`;

      const metaTags = generateMeta(seoData, {
        baseUrl,
        url: fullUrl,
        seoSchema,
        pwaSchema,
      });

      let renderedHtml = "";
      try {
        renderedHtml = renderToString(
          <Html
            assets={assets}
            cssFiles={cssToBeIncluded}
            preloadedData={preloadedData}
            metaTags={metaTags}
            pwaSchema={pwaSchema}
          >
            <ErrorBoundary ErrorComponent={routeHandler.getErrorComponent()}>
              <StaticRouter location={req.url}  context={context}>
                {renderRoutes(routes)}
              </StaticRouter>
            </ErrorBoundary>
          </Html>
        );
      } catch (err) {
        const ErrorComponent = routeHandler.getErrorComponent();
        renderedHtml = renderToString(
          <Html
            assets={assets}
            cssFiles={cssToBeIncluded}
            preloadedData={preloadedData}
            metaTags={metaTags}
            pwaSchema={pwaSchema}
          >
            <ErrorComponent error={err} />
          </Html>
        );
      }


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
    });
  }
}