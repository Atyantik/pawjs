import express from "express";
import _ from "lodash";
import RouteHandler from "../router/handler";
import ServerHandler from "./handler";
import env from "../config";

const rHandler = new RouteHandler({
  env: _.assignIn({}, env),
  isServer: true,
});

let ProjectRoutes = require(`${process.env.__project_root}/src/routes`);
if (ProjectRoutes.default) ProjectRoutes = ProjectRoutes.default;

rHandler.addPlugin(new ProjectRoutes({addPlugin: rHandler.addPlugin}));


let ProjectServer = require(`${process.env.__project_root}/src/server`);
if (ProjectServer.default) ProjectServer = ProjectServer.default;

const sHandler = new ServerHandler({
  env: _.assignIn({}, env)
});



const app = express();
//const ClientApp = require(`${process.env.__project_root}/src/app`);

const assetsToArray = (assets) => {
  let allAssets = [];
  if (assets instanceof Object) {
    _.each(assets, a => {
      if (typeof a === "string") {
        allAssets.push(a);
      } else if (a instanceof Object) {
        allAssets = allAssets.concat(assetsToArray(a));
      }
    });
  } else if (typeof assets === "string") {
    allAssets.push(assets);
  }
  allAssets = _.sortBy(allAssets, a => a.indexOf("hot-update") !== -1);
  return _.uniq(allAssets);
};

app.get("*", (req, res, next) => {
  // Get the resources
  const assets = assetsToArray(res.locals.assets);

  if (!res.locals.ssr) {
    return sHandler.run({
      req,
      res,
      next,
      assets
    });
  }
  // Wait for all routes to load everything!
  rHandler.hooks.initRoutes.callAsync(err => {
    if (err) {
      // eslint-disable-next-line
      console.log(err);
      // @todo: Handle Error
      return next();
    }
    return sHandler.run({
      routeHandler: rHandler,
      req,
      res,
      next,
      assets,
      cssDependencyMap: res.locals.cssDependencyMap
    });
  });

});

export default (req, res, next) => {
  return app.handle(req, res, next);
};
