import {renderErrorPage} from "./renderer";
import {Route as ServerRoute, StaticRouter as ServerRouter, Switch as ServerSwitch,} from "react-router";

/**
 * Apply server filter
 */
export const applyServerFilter = async (res, name = "", data,...otherArgs) => {
  if (res && res.locals && res.locals.wook && res.locals.wook.apply_filters && name) {
    return await res.locals.wook.apply_filters(name, data,...otherArgs);
  }
  return data;
};

/**
 * return the error component when error is provided with storage, store and api
 * @param err
 * @param store
 * @param storage
 * @param api
 */
export const getErrorComponent = (err, store, storage, api) => {
  if (!(err instanceof Error)) {
    err = new Error(err);
  }
  err.statusCode = err.statusCode || 500;
  return renderErrorPage({
    render: false,
    Router: ServerRouter,
    Route: ServerRoute,
    Switch: ServerSwitch,
    error: err,
    store,
    storage,
    api
  });
};