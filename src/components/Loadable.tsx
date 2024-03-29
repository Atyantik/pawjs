import React, {
  useEffect,
  useReducer,
  useRef,
} from 'react';
import { useLocation }  from 'react-router';
import { useParams } from 'react-router-dom';
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
    path: '',
    loader: null,
    loading: null,
    delay: 200,
    timeout: 0,
    webpack: [],
    modules: [],
    loadedData: null,
    selfManageNewProps: false,
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

  const loadableComponent = () => {
    const location = useLocation();
    const params = useParams();
    const props = { match: { params } };
    const previousRouterProps = useRef({
      location,
      params,
    });
    // console.log(opts.path, props);
    // Initialisation
    // Set res reference
    const resReference = useRef(init(undefined, props));
    // Current state of application
    const [
      loadableState,
      updateLoadableState,
    ] = useReducer(
      reducer,
      {
        ...initialState,
        ...{
          timedOut: false,
          loading: resReference.current.loading,
          error: resReference.current.error,
          pastDelay: opts.delay <= 0,
        },
      },
    );
    const previousCompleted = useRef(resReference.current.completed);
    // Set past delay timeout ref
    const pastDelayTimeoutRef: any = useRef();
    // Set timedOut timeout ref
    const timedOutTimeoutRef: any = useRef();
    // Set mounted state of current component
    const isMounted = useRef(false);
    // Set loading state of the module
    const isModuleLoading = useRef(false);
    const resetLoadableState = () => {
      if (isMounted.current) {
        updateLoadableState({
          type: 'UPDATE',
          payload: {
            timedOut: false,
            loading: resReference.current.loading,
            error: resReference.current.error,
            pastDelay: opts.delay <= 0,
          },
        });
      }
    };

    // Clear timeouts for pastDelay and timedOut
    const clearTimeouts = () => {
      if (pastDelayTimeoutRef.current) {
        clearTimeout(pastDelayTimeoutRef.current);
      }
      if (timedOutTimeoutRef.current) {
        clearTimeout(timedOutTimeoutRef.current);
      }
    };

    // load current module
    const loadModule = () => {
      if (
        !resReference
        || !resReference.current
        || (resReference.current.completed && previousCompleted.current)
        || !resReference.current.promise
        || !isMounted.current
        || isModuleLoading.current
      ) {
        return false;
      }
      // Set module loading to true
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
      const update = () => {
        if (isMounted.current) {
          clearTimeouts();
          updateLoadableState({
            type: 'UPDATE',
            payload: {
              timedOut: false,
              pastDelay: false,
              loading: resReference.current.loading,
              error: resReference.current.error,
            },
          });
        }
        previousCompleted.current = resReference.current.completed;
        isModuleLoading.current = false;
      };
      resReference.current.promise
        .then(update)
        .catch(update);
      return true;
    };

    const retry = () => {
      // reset state of res
      previousCompleted.current = false;
      res = loadFn(opts.loader, undefined, props);
      resReference.current = res;
      resetLoadableState();
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
      if (res.promise && res.promise.then) {
        res.promise.then(() => {
          loadModule();
        });
      } else {
        loadModule();
      }
    };

    if (
      !opts.selfManageNewProps
      && previousRouterProps.current.location?.key !== location.key
    ) {
      // Component will receive props
      // The route has been changed, and the component remains the same
      // console.log('Props changed, route changed');
      retry();
      previousRouterProps.current = {
        location,
        params,
      };
    } else if (!previousRouterProps.current) {
      previousRouterProps.current = {
        location,
        params,
      };
    }

    useEffect(
      () => {
        // component did mount
        isMounted.current = true;
        loadModule();
        return () => {
          // component will unmount
          // @ts-ignore
          res = undefined;
          isMounted.current = false;
          clearTimeouts();
        };
      },
      [],
    );
    if (
      loadableState.loading
      || resReference.current.loading
      || loadableState.error
    ) {
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
  };
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
