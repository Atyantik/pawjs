import "../../src/promise-polyfill";
import React from "react";
import {render, hydrate} from "react-dom";

const rootElement = document.getElementById("app");
const initApp = () => {
  return import("./app").then(App => {
    //ReactDOM.hydrate(<App.default />, rootElement);
    if (process.env.__config_serverSideRender) {
      hydrate(<App.default />, rootElement);
    } else {
      render(<App.default />, rootElement);
    }
  });
};

if (typeof window.Symbol === "undefined") {
	import("@babel/polyfill").then(initApp);
} else {
  initApp();
}

if (module.hot) module.hot.accept();
