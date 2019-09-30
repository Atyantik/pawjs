import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

const ALL_INITIALIZERS = [];
const READY_INITIALIZERS = [];

const isWebpackReady = (getModuleIds: () => any []) => {
  // @ts-ignore
  // eslint-disable-next-line camelcase
  if (typeof __webpack_modules__ !== 'object') {
    return false;
  }

  return getModuleIds().every(moduleId => (
    typeof moduleId !== 'undefined'
    // @ts-ignore
    // eslint-disable-next-line camelcase
    && typeof __webpack_modules__[moduleId] !== 'undefined'
  ));
};

type LoadableState = {
  loading: boolean;
  loaded: any;
  error?: Error | null;
  promise?: Promise<any>;
};

const load = (
  loader: (arg0: any) => Promise<any>,
  props?: any,
): LoadableState => {
  const p = loader(props);
  let promise = p;
  if (typeof p.then === 'undefined') {
    promise = new Promise(res => res(p));
  }
  const state: LoadableState = {
    loading: true,
    loaded: null,
  };

  state.promise = promise.then((loaded) => {
    state.loading = false;
    state.loaded = loaded;
    return loaded;
  }).catch((err: Error) => {
    state.loading = false;
    state.error = err;
    throw err;
  });
  return state;
};

const loadMap = (
  obj: any,
  loadedData: any,
  props: any,
): LoadableState => {
  const state: LoadableState = {
    loading: false,
    loaded: {},
  };

  const promises: Promise<any> [] = [];
  try {
    Object.keys(obj).forEach((key) => {
      let result = null;
      if (key === 'LoadData' && loadedData) {
        result = {
          loading: false,
          loaded: loadedData,
          promise: (async () => loadedData)(),
        };
      } else {
        if (key === 'LoadData') {
          result = load(obj[key], props);
        } else {
          result = load(obj[key]);
        }

        if (!result.loading) {
          state.loaded[key] = result.loaded;
          state.error = result.error;
        } else {
          state.loading = true;
        }
      }

      if (result.promise) {
        promises.push(result.promise);
        result.promise.then((res) => {
          state.loaded[key] = res;
        }).catch((err) => {
          state.error = err;
        });
      }
    });
  } catch (err) {
    state.error = err;
  }

  state.promise = Promise.all(promises).then((res) => {
    state.loading = false;
    return res;
  }).catch((err) => {
    state.loading = false;
    throw err;
  });

  return state;
};

// eslint-disable-next-line no-underscore-dangle
const resolve = (obj: any) => (obj && obj.__esModule ? obj.default : obj);

const render = (loaded: any, props: any) => React.createElement(resolve(loaded), props);

const createLoadableComponent = (
  loadFn: (arg0?: any, arg1?: any, arg2?: any, arg3?: any) => LoadableState,
  options: {
    render?: any;
    loading?: any;
  },
) => {
  if (!options.loading) {
    throw new Error('react-loadable requires a `loading` component');
  }

  const opts = {
    render,
    loader: null,
    loading: null,
    delay: 200,
    timeout: 0,
    webpack: [],
    modules: null,
    loadedData: null,
    loadDataCache: false,
    ...options,
  };

  let res: LoadableState | null = null;
  const init = (loadedData: any, props: any): Promise<any> => {
    if (!res) {
      res = loadFn(opts.loader, loadedData, props);
    }
    if (!res.promise) {
      throw new Error('Invalid state received from loadFn');
    }
    return res.promise;
  };

  const loadableComponent = (
    {
      match,
      route,
      location,
      ...otherProps
    },
  ) => {
    /* eslint-disable react-hooks/rules-of-hooks */
    const [error, setError] = useState(res && res.error ? res.error : undefined);
    const [pastDelay, setPastDelay] = useState(opts.delay <= 0);
    const [loading, setLoading] = useState(res ? res.loading : true);
    const [loaded, setLoaded] = useState(res ? res.loaded : null);
    // Managing state of past delay
    useEffect(
      () => {
        let timeout: any = 0;
        if (opts.delay) {
          timeout = setTimeout(
            () => {
              setPastDelay(true);
            },
            opts.delay,
          );
        }
        return () => {
          if (timeout) {
            clearTimeout(timeout);
          }
        };
      },
      [],
    );

    const [timedOut, setTimeoutOut] = useState(false);
    // Managing state of past delay
    useEffect(
      () => {
        let timeout: any = 0;
        if (opts.timeout) {
          timeout = setTimeout(
            () => {
              setTimeoutOut(true);
            },
            opts.timeout,
          );
        }
        return () => {
          if (timeout) {
            clearTimeout(timeout);
          }
        };
      },
      [],
    );

    init(undefined, {
      match,
      route,
      ...otherProps,
    });

    if (loading || error) {
      return React.createElement(opts.loading, {
        pastDelay,
        timedOut,
        error,
        isLoading: loading,
        retry: this.retry,
      });
    } if (loaded) {
      return opts.render(loaded, this.props);
    }
    return null;
  };
  loadableComponent.preload = init;
  return withRouter(loadableComponent);
};

export default (opts: { render?: any; loading?: any; }) => createLoadableComponent(load, opts);

const loadableMap = (opts: { render: any; }) => {
  if (typeof opts.render !== 'function') {
    throw new Error('LoadableMap requires a `render(loaded, props)` function');
  }

  return createLoadableComponent(loadMap, opts);
};

export {
  loadableMap as Map,
};
