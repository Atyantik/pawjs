import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

const ALL_INITIALIZERS = [];
const READY_INITIALIZERS = [];

function load(loader, props) {
  const p = loader(props);
  let promise = p;
  if (typeof p.then === 'undefined') {
    promise = new Promise(res => res(p));
  }

  const state = {
    loading: true,
    loaded: null,
    error: null,
  };

  state.promise = promise.then((loaded) => {
    state.loading = false;
    state.loaded = loaded;
    return loaded;
  }).catch((err) => {
    state.loading = false;
    state.error = err;
    throw err;
  });

  return state;
}

function loadMap(obj, loadedData, props) {
  const state = {
    loading: false,
    loaded: {},
    error: null,
  };

  const promises = [];

  try {
    Object.keys(obj).forEach((key) => {
      let result = null;
      if (key === 'LoadData' && loadedData) {
        result = {
          loading: false,
          loaded: loadedData,
          error: null,
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

      promises.push(result.promise);

      result.promise.then((res) => {
        state.loaded[key] = res;
      }).catch((err) => {
        state.error = err;
      });
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
}

function resolve(obj) {
  // eslint-disable-next-line
  return obj && obj.__esModule ? obj.default : obj;
}

function render(loaded, props) {
  return React.createElement(resolve(loaded), props);
}

function createLoadableComponent(loadFn, options) {
  if (!options.loading) {
    throw new Error('react-loadable requires a `loading` component');
  }

  const opts = Object.assign({
    loader: null,
    loading: null,
    delay: 200,
    timeout: null,
    render,
    webpack: null,
    modules: null,
    loadedData: null,
    loadDataCache: false,
  }, options);

  let res = null;

  function init(loadedData, props) {
    if (!res) {
      res = loadFn(opts.loader, loadedData, props);
    }
    return res.promise;
  }

  class LoadableComponent extends React.Component {
    static propTypes = {
      // eslint-disable-next-line
      match: PropTypes.any,
      // eslint-disable-next-line
      route: PropTypes.any,
      // eslint-disable-next-line
      location: PropTypes.any,
    };

    static contextTypes = {
      loadable: PropTypes.shape({
        report: PropTypes.func.isRequired,
      }),
    };

    static preload(loadedData, props) {
      return init(loadedData, props);
    }

    constructor(props) {
      super(props);

      const { match, route, ...otherProps } = props;
      init(undefined, {
        match,
        route,
        ...otherProps,
      });

      this.state = {
        error: res.error,
        pastDelay: false,
        timedOut: false,
        loading: res.loading,
        loaded: res.loaded,
      };
    }

    componentWillMount() {
      this.mounted = true;
      this.loadModule();
    }

    componentWillReceiveProps(nextProps) {
      const { location } = this.props;
      const prevLocation = { ...location };
      const newLocation = { ...nextProps.location };
      delete prevLocation.key;
      delete newLocation.key;

      if (JSON.stringify(prevLocation) !== JSON.stringify(newLocation)) {
        res = null;
        const { route, match, ...otherNextProps } = nextProps;
        init(undefined, {
          route,
          match,
          ...otherNextProps,
        });
        this.setState({
          error: res.error,
          pastDelay: false,
          timedOut: false,
          loading: res.loading,
          loaded: res.loaded,
        });
        this.loadModule();
      }
    }

    componentWillUnmount() {
      this.mounted = false;
      this.clearTimeouts();

      // clear response if user does not want the
      // data to be cached
      if (!opts.loadDataCache) {
        res = null;
      }
    }

    retry = () => {
      this.setState({ error: null, loading: true });
      const {
        match,
        route,
        ...otherProps
      } = this.props;
      res = loadFn(opts.loader, undefined, { match, route, ...otherProps });
      this.loadModule();
    };

    loadModule() {
      if (!res.loading) {
        return;
      }

      if (typeof opts.delay === 'number') {
        if (opts.delay === 0) {
          this.setState({ pastDelay: true });
        } else {
          this.delay = setTimeout(() => {
            this.setState({ pastDelay: true });
          }, opts.delay);
        }
      }

      if (typeof opts.timeout === 'number') {
        this.timeout = setTimeout(() => {
          this.setState({ timedOut: true });
        }, opts.timeout);
      }

      const update = () => {
        if (!this.mounted) {
          return;
        }
        if (!res) return;

        this.setState({
          error: res.error,
          loaded: res.loaded,
          loading: res.loading,
        });

        this.clearTimeouts();
      };

      res.promise.then(() => {
        update();
      }).catch(() => {
        update();
      });
    }

    clearTimeouts() {
      clearTimeout(this.delay);
      clearTimeout(this.timeout);
    }

    render() {
      const {
        loading,
        error,
        pastDelay,
        timedOut,
        loaded,
      } = this.state;
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
    }
  }
  return withRouter(LoadableComponent);
}

function Loadable(opts) {
  return createLoadableComponent(load, opts);
}

function LoadableMap(opts) {
  if (typeof opts.render !== 'function') {
    throw new Error('LoadableMap requires a `render(loaded, props)` function');
  }

  return createLoadableComponent(loadMap, opts);
}

Loadable.Map = LoadableMap;

function flushInitializers(initializers) {
  const promises = [];

  while (initializers.length) {
    const init = initializers.pop();
    promises.push(init());
  }

  return Promise.all(promises).then(() => {
    if (initializers.length) {
      return flushInitializers(initializers);
    }
    return false;
  });
}

Loadable.preloadAll = () => new Promise((res, reject) => {
  flushInitializers(ALL_INITIALIZERS).then(res, reject);
});

Loadable.preloadReady = () => new Promise((res) => {
  // We always will resolve, errors should be handled within loading UIs.
  flushInitializers(READY_INITIALIZERS).then(res, res);
});

export default Loadable;
