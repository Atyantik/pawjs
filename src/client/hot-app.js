import React from "react";
import clientHandler from "./app";
import { hot } from "react-hot-loader";

const App = props => props.children;
const HotApp = hot(module)(App);

clientHandler.hooks.beforeRender.tap("AddHotModuleLoader", (app) => {
  app.children = <HotApp>{app.children}</HotApp>;
});

module && module.hot && module.hot.accept && module.hot.accept();