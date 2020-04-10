import React from 'react';
import { AsyncSeriesHook } from 'tapable';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import ReduxTapable from './tapable';
import { cloneDeep } from './util';

export default class ReduxClient extends ReduxTapable {
  constructor() {
    super();
    this.hooks = {
      reduxInitialState: new AsyncSeriesHook(['state']),
    };
  }

  apply(clientHandler) {
    clientHandler.hooks.beforeLoadData.tapPromise('AddReduxProvider', async (setParams, getParams) => {
      const providerProps = {};
      if (!this.reducers) return;

      let initialState = window.PAW__REDUX_PRELOADED_STATE;

      // Allow the passed state to be garbage-collected
      delete window.PAW__REDUX_PRELOADED_STATE;

      const state = {
        setInitialState: (iState) => {
          initialState = cloneDeep(iState);
        },
        getInitialState: () => {
          if (typeof initialState === 'undefined') return {};
          return cloneDeep(initialState);
        },
      };
      await new Promise(r => this.hooks.reduxInitialState.callAsync(state, r));
      let composeEnhancers = compose;
      // eslint-disable-next-line
      if (process.env.PAW_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
        // eslint-disable-next-line
        composeEnhancers = __REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
      }

      try {
        window.paw__reduxStore = window.paw__reduxStore || createStore(
          this.reducers,
          initialState,
          composeEnhancers(
            applyMiddleware(...this.middlewares),
            ...this.enhancers,
          ),
        );
        providerProps.store = window.paw__reduxStore;
        setParams('store', providerProps.store);
      } catch (ex) {
        // console.log redux error
        // eslint-disable-next-line
        console.error(ex);
      }
    });

    clientHandler.hooks.beforeRender.tapPromise('AddReduxProvider', async (app) => {
      // eslint-disable-next-line
      app.children = (
        <Provider store={window.paw__reduxStore}>
          {app.children}
        </Provider>
      );
    });
  }
}
