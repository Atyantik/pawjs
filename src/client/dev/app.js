import _ from "lodash";
import ServiceManager from "../../service-manager";
import ClientService from "../service";
import { env } from "../../config/index";

let ProjectClientPlugin = require(`${process.env.__project_root}/src/client`).default;
if (ProjectClientPlugin.default) {
  ProjectClientPlugin = ProjectClientPlugin.default;
}

const app = new ClientService({
  root: _.get(env, "divRoot", "app"),
  env: env("development")
});

const manager = new ServiceManager({
  env: env("development"),
  app: app,
});

app.setServiceManager(manager);
app.initPlugins((env.plugins? env.plugins: []).concat([]));
app.addPlugin(new ProjectClientPlugin());

app.run();


// const rootElement = document.getElementById("app");
// const initApp = () => {
//   return import("./app").then(App => {
//     if (process.env.__config_serverSideRender) {
//       hydrate(<App.default />, rootElement);
//     } else {
//       render(<App.default />, rootElement);
//     }
//   });
// };
//
// if (typeof window.Symbol === "undefined") {
//   import("@babel/polyfill").then(initApp);
// } else {
//   initApp();
// }
//
// if (module.hot) module.hot.accept();