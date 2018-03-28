import express from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import _ from "lodash";
import Html from "../components/html";

const app = express();
const ClientApp = require(`${process.env.__project_root}/src/app`);

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
  return _.uniq(allAssets);
};

app.get("/", (req, res) => {
  // Get the resources
  const assets = assetsToArray(res.locals.assets);
  res.write("<!DOCTYPE html>");
  let childComponent = null;

  if (res.locals.ssr) {
    // something with ssr
    childComponent = <ClientApp.default />;
  }

  ReactDOMServer.renderToNodeStream(
    <Html
      assets={assets}
    >{childComponent}</Html>
  ).pipe(res);
});

export default (req, res, next) => {
  return app.handle(req, res, next);
};
