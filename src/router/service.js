import { Tapable } from "tapable";
import AsyncRouteLoadErrorComponent from "../components/AsyncRouteLoadError";
import AsyncRouteLoaderComponent from "../components/AsyncRouteLoader";
import RouteCompiler from "./compiler";


export default class RouterService extends Tapable {

  routeCompiler = new RouteCompiler();
  routes = [];

  constructor() {
    super();
    this.hooks = {};

    // Private methods
    let loadErrorComponent = AsyncRouteLoadErrorComponent;
    let loaderComponent = AsyncRouteLoaderComponent;
    let delay = 300;
    let timeout = 10000;

    this.setLoadErrorComponent = component => {
      loadErrorComponent = component;
      return this;
    };

    this.getLoadErrorComponent = () => {
      return loadErrorComponent;
    };

    this.setLoaderComponent = component => {
      loaderComponent = component;
      return this;
    };

    this.getLoaderComponent = () => {
      return loaderComponent;
    };

    this.setAllowedLoadDelay = allowedDelay => {
      delay = allowedDelay;
      return this;
    };

    this.getAllowedLoadDelay = () => {
      return delay;
    };

    this.setLoadTimeout = loadTimeout => {
      timeout = loadTimeout;
      return this;
    };

    this.getLoadTimeout = () => {
      return timeout;
    };
  }

  addRoute(route) {
    const compiledRoute = this.routeCompiler.compileRoute(route, this);
    this.routes.push(compiledRoute);
    this.routes = _.uniq(this.routes);
  }

  addRoutes(routes) {
    const compiledRoutes = this.routeCompiler.compileRoutes(routes, this);
    this.routes = this.routes.concat(compiledRoutes);
    this.routes = _.uniq(this.routes);
  }

  getRoutes() {
    return _.cloneDeep(this.routes);
  }
}