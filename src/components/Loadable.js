"use strict";
import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";

const ALL_INITIALIZERS = [];
const READY_INITIALIZERS = [];

function load(loader, props) {
  let promise = loader(props);

  let state = {
    loading: true,
    loaded: null,
    error: null
  };

  state.promise = promise.then(loaded => {
    state.loading = false;
    state.loaded = loaded;
    return loaded;
  }).catch(err => {
    state.loading = false;
    state.error = err;
    throw err;
  });

  return state;
}

function loadMap(obj, loadedData, props) {
  let state = {
    loading: false,
    loaded: {},
    error: null
  };

  let promises = [];

  try {
    Object.keys(obj).forEach(key => {
      let result = null;
      if(key === "LoadData" && loadedData) {
        result = {
          loading: false,
          loaded: loadedData,
          error: null,
          promise: (async () => loadedData)()
        };
      } else {
        if (key === "LoadData") {
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

      result.promise.then(res => {
        state.loaded[key] = res;
      }).catch(err => {
        state.error = err;
      });
    });
  } catch (err) {
    state.error = err;
  }

  state.promise = Promise.all(promises).then(res => {
    state.loading = false;
    return res;
  }).catch(err => {
    state.loading = false;
    throw err;
  });

  return state;
}

function resolve(obj) {
  return obj && obj.__esModule ? obj.default : obj;
}

function render(loaded, props) {
  return React.createElement(resolve(loaded), props);
}

function createLoadableComponent(loadFn, options) {
  if (!options.loading) {
    throw new Error("react-loadable requires a `loading` component");
  }

  let opts = Object.assign({
    loader: null,
    loading: null,
    delay: 200,
    timeout: null,
    render: render,
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

    constructor(props) {
      super(props);
      init(undefined, {match: props.match, route: props.route});

      this.state = {
        error: res.error,
        pastDelay: false,
        timedOut: false,
        loading: res.loading,
        loaded: res.loaded
      };
    }

    static contextTypes = {
      loadable: PropTypes.shape({
        report: PropTypes.func.isRequired,
      }),
    };

    static preload(loadedData, props) {
      return init(loadedData, props);
    }

    componentWillMount() {
      this._mounted = true;
      this._loadModule();
    }

    componentWillReceiveProps(nextProps) {
      let prevLocation = {...this.props.location};
      let newLocation = {...nextProps.location};
      delete prevLocation.key;
      delete newLocation.key;

      if (JSON.stringify(prevLocation) !== JSON.stringify(newLocation)) {
        res = null;
        init(undefined, {route: nextProps.route, match: nextProps.match});
        this._loadModule();
      }
    }

    _loadModule() {

      if (!res.loading) {
        return;
      }

      if (typeof opts.delay === "number") {
        if (opts.delay === 0) {
          this.setState({ pastDelay: true });
        } else {
          this._delay = setTimeout(() => {
            this.setState({ pastDelay: true });
          }, opts.delay);
        }
      }

      if (typeof opts.timeout === "number") {
        this._timeout = setTimeout(() => {
          this.setState({ timedOut: true });
        }, opts.timeout);
      }

      let update = () => {
        if (!this._mounted) {
          return;
        }
        if (!res) return;

        this.setState({
          error: res.error,
          loaded: res.loaded,
          loading: res.loading
        });

        this._clearTimeouts();
      };

      res.promise.then(() => {
        update();
      }).catch(() => {
        update();
      });
    }

    componentWillUnmount() {
      this._mounted = false;
      this._clearTimeouts();

      // clear response if user does not want the
      // data to be cached
      if(!opts.loadDataCache) {
        res = null;
      }
    }

    _clearTimeouts() {
      clearTimeout(this._delay);
      clearTimeout(this._timeout);
    }

    retry = () => {
      this.setState({ error: null, loading: true });
      res = loadFn(opts.loader, undefined, {match: this.props.match, route: this.props.route});
      this._loadModule();
    };

    render() {
      if (this.state.loading || this.state.error) {
        return React.createElement(opts.loading, {
          isLoading: this.state.loading,
          pastDelay: this.state.pastDelay,
          timedOut: this.state.timedOut,
          error: this.state.error,
          retry: this.retry
        });
      } else if (this.state.loaded) {
        return opts.render(this.state.loaded, this.props);
      } else {
        return null;
      }
    }
  }
  return withRouter(LoadableComponent);
}

function Loadable(opts) {
  return createLoadableComponent(load, opts);
}

function LoadableMap(opts) {
  if (typeof opts.render !== "function") {
    throw new Error("LoadableMap requires a `render(loaded, props)` function");
  }

  return createLoadableComponent(loadMap, opts);
}

Loadable.Map = LoadableMap;

function flushInitializers(initializers) {
  let promises = [];

  while (initializers.length) {
    let init = initializers.pop();
    promises.push(init());
  }

  return Promise.all(promises).then(() => {
    if (initializers.length) {
      return flushInitializers(initializers);
    }
  });
}

Loadable.preloadAll = () => {
  return new Promise((resolve, reject) => {
    flushInitializers(ALL_INITIALIZERS).then(resolve, reject);
  });
};

Loadable.preloadReady = () => {
  return new Promise(resolve => {
    // We always will resolve, errors should be handled within loading UIs.
    flushInitializers(READY_INITIALIZERS).then(resolve, resolve);
  });
};

export default Loadable;