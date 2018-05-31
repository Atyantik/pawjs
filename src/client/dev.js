import "../promise-polyfill";

const importApp = () => import("./app");

// Load polyfill depending on browser, this can also be used to load browser specific files only.
if (typeof window.Symbol === "undefined") {
  import("@babel/polyfill").then(importApp);
} else {
  importApp();
}

if (module.hot) module.hot.accept();