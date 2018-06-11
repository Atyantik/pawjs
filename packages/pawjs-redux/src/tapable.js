import { Tapable } from "tapable";
import { combineReducers} from "redux";

export default class ReduxTapable extends Tapable {
  reducers = null;
  middlewares = [];
  enhancers =[];

  addMiddleware(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  addEnhancer(enhancer) {
    this.enhancers.push(enhancer);
    return this;
  }

  setReducers(reducers) {
    if (typeof reducers === "function") {
      this.reducers = reducers;
      return;
    }
    this.reducers = combineReducers(reducers);
  }
}