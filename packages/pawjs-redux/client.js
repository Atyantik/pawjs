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
      reduxInitialState: new AsyncSeriesHook(['state', 'application']),
    };
  }

  apply(clientHandler) {
    clientHandler.hooks.beforeRender.tapPromise('AddReduxProvider', async (app) => {
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
      await new Promise(r => this.hooks.reduxInitialState.callAsync(state, app, r));
      // eslint-disable-next-line
      const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

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
      } catch (ex) {
        // console.log redux error
        // eslint-disable-next-line
        console.error(ex);
      }

      // eslint-disable-next-line
      app.children = (
        <Provider {...providerProps}>
          {app.children}
        </Provider>
      );
    });
  }
}
