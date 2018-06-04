import {
  Tapable,
  AsyncParallelHook,
  SyncHook
} from "tapable";
import React from "react";
import _ from "lodash";
import { renderToNodeStream, renderToString } from "react-dom/server";
import Html from "../components/html";
import {matchRoutes, renderRoutes} from "react-router-config";
import { StaticRouter } from "react-router";
import ErrorBoundary from "../components/ErrorBoundary";

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

    if (!res.locals.ssr) {
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

    currentPageRoutes.forEach(({route}) => {
      route.webpack && modulesInRoutes.push(...route.webpack());
      if (route.component.preload) {
        promises.push(route.component.preload());
      }
    });

    modulesInRoutes.forEach(mod => {
      cssDependencyMap.forEach(c => {
        if (_.indexOf(c.modules, mod) !== -1) {
          cssToBeIncluded.push(c.path);
        }
      });
    });

    Promise.all(promises).then(args => {
      currentPageRoutes.forEach((r,i) => {
        args[i] && preloadedData.push(args[i][1]);
      });


      let renderedHtml = "";
      try {
        renderedHtml = renderToString(
          <Html
            assets={assets}
            css={cssToBeIncluded}
            preloadedData={preloadedData}
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
            css={cssToBeIncluded}
            preloadedData={preloadedData}
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