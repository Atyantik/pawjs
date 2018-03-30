import { Tapable, SyncHook } from "tapable";
import AsyncRouteLoadErrorComponent from "../components/AsyncRouteLoadError";
import AsyncRouteLoaderComponent from "../components/AsyncRouteLoader";


export default class RouterService extends Tapable {

  constructor() {
    super();
    this.hooks = {
      "init": new SyncHook("router"),
    };

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
}