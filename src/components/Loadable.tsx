import React, {
  useCallback,
  useEffect, useReducer, useRef, useState,
} from 'react';
import { withRouter } from 'react-router';
import loadMap, { load, LoadableState } from '../utils/loadable';

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
    throw new Error('loadable requires a `loading` component');
  }

  const opts = {
    render,
    loader: null,
    loading: null,
    delay: 200,
    timeout: 0,
    webpack: [],
    modules: [],
    loadedData: null,
    ...options,
  };

  /**
   * Cached res object so the promise or loading
   * is not executed multiple times
   */
  let res: LoadableState;
  const init = (loadedData: any, props: any): LoadableState => {
    if (!res) {
      res = loadFn(opts.loader, loadedData, props);
    }
    if (!res.promise) {
      throw new Error('Invalid state received from loadFn');
    }
    return res;
  };

  const initialState = {
    loading: false,
    error: null,
    pastDelay: false,
    timedOut: false,
  };

  function reducer(state: any = initialState, action: any) {
    switch (action.type) {
      case 'SET_ERROR':
        return { ...state, ...{ error: action.error } };
      case 'SET_LOADING':
        return { ...state, ...{ loading: action.loading } };
      case 'SET_PAST_DELAY':
        return { ...state, ...{ pastDelay: action.pastDelay } };
      case 'SET_TIMED_OUT':
        return { ...state, ...{ timedOut: action.timedOut } };
      case 'UPDATE':
        return { ...state, ...action.payload };
      default:
        return state;
    }
  }

  const loadableComponent = withRouter((props: any) => {
    const resReference = useRef(
      (res && res.completed)
        ? res : init(undefined, props),
    );
    const clearResReference = () => {
      // @ts-ignore
      res = null;
      resReference.current = {
        completed: false,
        resource: null,
        loading: false,
        error: null,
      };
    };
    const [previousCompleted, setPreviousCompleted] = useState(resReference.current.completed);
    useEffect(
      () => {
        setPreviousCompleted(resReference.current.completed);
      },
      [
        resReference.current.completed,
      ],
    );
    const [
      loadableState,
      updateLoadableState,
    ] = useReducer(
      reducer,
      {
        ...initialState,
        ...{
          loading: resReference.current.loading,
          error: resReference.current.error,
          pastDelay: opts.delay <= 0,
        },
      },
    );
    const pastDelayTimeoutRef: any = useRef();
    const timedOutTimeoutRef: any = useRef();
    const isMounted = useRef(false);
    const isModuleLoading = useRef(false);

    const clearTimeouts = () => {
      if (pastDelayTimeoutRef.current) {
        clearTimeout(pastDelayTimeoutRef.current);
      }
      if (timedOutTimeoutRef.current) {
        clearTimeout(timedOutTimeoutRef.current);
      }
    };
    useEffect(
      () => {
        isMounted.current = true;
        return () => {
          isMounted.current = false;
          clearTimeouts();
        };
      },
      [],
    );
    const loadModule = useCallback(
      () => {
        if (
          // Do not load if current res reference is not present
          !resReference
          || (resReference.current.completed && previousCompleted)
          // If module is already loaded, then we do not need to load it twice
          || isModuleLoading.current
          // Also, Do not load if current component is not mounted anymore
          || !isMounted.current
        ) {
          return false;
        }
        isModuleLoading.current = true;
        // Clear previous timeouts
        clearTimeouts();

        if (opts.delay > 0) {
          pastDelayTimeoutRef.current = setTimeout(
            () => {
              if (isMounted.current) {
                isModuleLoading.current = false;
                updateLoadableState({ type: 'SET_PAST_DELAY', pastDelay: true });
              }
            },
            opts.delay,
          );
        }
        if (opts.timeout) {
          timedOutTimeoutRef.current = setTimeout(
            () => {
              if (isMounted.current) {
                isModuleLoading.current = false;
                updateLoadableState({ type: 'SET_TIMED_OUT', timedOut: true });
              }
            },
            opts.timeout,
          );
        }

        if (resReference.current.promise) {
          resReference.current.promise
            .finally(() => {
              if (isMounted.current) {
                clearTimeouts();
                updateLoadableState({
                  type: 'UPDATE',
                  payload: {
                    loading: resReference.current.loading,
                    error: resReference.current.error,
                  },
                });
              }
              isModuleLoading.current = false;
            });
        }
        return true;
      },
      [
        previousCompleted,
      ],
    );

    const [location, setLocation] = useState(props.history.location);
    const historyCallback = useCallback(
      (newLocation) => {
        // @ts-ignore
        res = null;
        if (
          newLocation.pathname === location.pathname && (
            newLocation.search !== location.search
            || newLocation.hash !== location.hash
          )
        ) {
          resReference.current = init(undefined, props);
          isModuleLoading.current = false;
          updateLoadableState(init(undefined, props));
          loadModule();
        }
        setLocation(newLocation);
      },
      [
        location,
        props,
      ],
    );
    const historyUnlisten: any = useRef(null);
    useEffect(
      () => {
        loadModule();
        historyUnlisten.current = props.history.listen(historyCallback);
        return () => {
          if (historyUnlisten.current) {
            historyUnlisten.current();
          }
          clearResReference();
        };
      },
      [],
    );

    const retry = () => {
      // @ts-ignore
      res = null;
      resReference.current = init(undefined, props);
      updateLoadableState({
        ...{
          error: resReference.current.error,
          loading: resReference.current.loading,
          timedOut: false,
          pastDelay: opts.delay <= 0,
        },
      });
      loadModule();
    };
    if (loadableState.loading || loadableState.error) {
      if (!opts.loading) return null;
      return (
        <opts.loading
          retry={retry}
          pastDelay={loadableState.pastDelay}
          timedOut={loadableState.timedOut}
          error={loadableState.error}
        />
      );
    }
    if (resReference.current.completed) {
      return opts.render(resReference.current.resource, props);
    }
    return null;
  });
  // @ts-ignore
  loadableComponent.preload = init;
  return loadableComponent;
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
