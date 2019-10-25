import React, { useEffect, useRef, useState } from 'react';
import { withRouter } from 'react-router';

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
  const init = (loadedData: any, props: any): LoadableState => {
    if (!res) {
      res = loadFn(opts.loader, loadedData, props);
    }
    if (!res.promise) {
      throw new Error('Invalid state received from loadFn');
    }
    return res;
  };

  const loadableComponent = (props: any) => {
    const {
      match,
      route,
      location,
      ...otherProps
    } = props;
    /* eslint-disable react-hooks/rules-of-hooks */
    const resReference = useRef(init(undefined, {
      match,
      route,
      ...otherProps,
    }));
    const updateRes = (loadedData = undefined, extraProps: any) => {
      resReference.current = init(loadedData, extraProps);
      return resReference;
    };

    const [error, setError] = useState(
      resReference
        && resReference.current
        && resReference.current.error
        ? resReference.current.error
        : undefined,
    );
    const [loading, setLoading] = useState(
      resReference
      && resReference.current
        ? resReference.current.loading
        : true,
    );
    const [loaded, setLoaded] = useState(
      resReference
        && resReference.current
        ? resReference.current.loaded
        : null,
    );
    if (resReference && resReference.current && resReference.current.promise) {
      resReference.current.promise.then(() => {
        setError(resReference.current.error
          ? resReference.current.error
          : undefined);
        setLoading(resReference.current.loading);
        setLoaded(resReference.current.loaded);
      });
    }
    const [pastDelay, setPastDelay] = useState(opts.delay <= 0);
    const pastDelayTimeoutRef: any = useRef();
    const [timedOut, setTimedOut] = useState(false);
    const timedOutTimeoutRef: any = useRef();
    const clearTimeouts = () => {
      if (pastDelayTimeoutRef.current) {
        clearTimeout(pastDelayTimeoutRef.current);
      }
      if (timedOutTimeoutRef.current) {
        clearTimeout(timedOutTimeoutRef.current);
      }
    };
    const componentState = useRef({ mounted: false });
    useEffect(
      () => {
        componentState.current = { mounted: true };
        return () => {
          componentState.current = { mounted: false };
        };
      },
      [],
    );

    const loadModule = () => {
      if (
        // Do not load if current res reference is not present
        !resReference.current
        // Also, Do not load if current res reference is already loading
        || !resReference.current.loading
        // Also, Do not load if current component is not mounted anymore
        || !componentState.current.mounted
      ) {
        return false;
      }
      // Clear previous timeouts
      clearTimeouts();

      if (opts.delay === 0) {
        // If no delay amount specified mark the module as past delay
        setPastDelay(true);
      } else {
        pastDelayTimeoutRef.current = setTimeout(
          () => {
            setPastDelay(true);
          },
          opts.delay,
        );
      }
      if (opts.timeout) {
        timedOutTimeoutRef.current = setTimeout(
          () => {
            setTimedOut(true);
          },
          opts.timeout,
        );
      }

      const update = () => {
        if (!componentState.current.mounted) {
          return;
        }
        if (resReference
          && resReference.current
        ) {
          if (resReference.current.error) {
            setError(resReference.current.error);
          }
          setLoaded(resReference.current.loaded);
          setLoading(resReference.current.loading);
        }
        clearTimeouts();
      };

      if (resReference.current.promise) {
        resReference.current.promise
          .then(() => {
            update();
          })
          .catch(() => {
            update();
          });
      }
      return true;
    };
    useEffect(
      () => {
        loadModule();
      },
      [],
    );

    const retry = () => {
      setError(undefined);
      setLoading(true);
      setTimedOut(false);
      loadModule();
    };
    if (loading) {
      return React.createElement(opts.loading || null, {
        retry,
        pastDelay,
        timedOut,
        error,
        isLoading: loading,
      });
    } if (loaded) {
      return opts.render(loaded, props);
    }
    return null;
  };
  loadableComponent.preload = init;
  // @ts-ignore
  return withRouter(loadableComponent);
};

export default (opts: { render?: any; loading?: any; }) => createLoadableComponent(load, opts);

const loadableMap = (opts: any) => {
  if (typeof opts.render !== 'function') {
    throw new Error('Loadable\'s Map requires a `render(loaded, props)` function');
  }

  return createLoadableComponent(loadMap, opts);
};

export {
  loadableMap as Map,
};
