import React from 'react';
import { AsyncSeriesHook } from 'tapable';
import { applyMiddleware, compose, createStore } from 'redux';
import { Provider } from 'react-redux';
import ReduxTapable from './tapable';
import { cloneDeep } from './util';

export default class ReduxServer extends ReduxTapable {
  constructor() {
    super();
    this.hooks = {
      reduxInitialState: new AsyncSeriesHook(['state', 'req', 'res']),
    };
  }

  apply(serverHandler) {
    serverHandler.hooks.beforeLoadData.tapPromise('AddReduxProvider', async (setParams, getParams , req, res) => {
      const providerProps = {};
      if (!this.reducers) return;

      let initialState;
      const state = {
        setInitialState: (iState) => {
          initialState = cloneDeep(iState);
        },
        getInitialState: () => {
          if (typeof initialState === 'undefined') return {};
          return cloneDeep(initialState);
        },
      };
      await new Promise(r => this.hooks.reduxInitialState.callAsync(state, req, res, r));

      try {
        providerProps.store = createStore(
          this.reducers,
          initialState,
          compose(
            applyMiddleware(...this.middlewares),
            ...this.enhancers,
          ),
        );
        res.locals.reduxStore = providerProps.store;
        setParams('store', res.locals.reduxStore);
      } catch (ex) {
        // console.log redux error
        // eslint-disable-next-line
        console.error(ex);
      }


    });

    serverHandler.hooks.beforeAppRender.tapPromise('AddReduxProvider', async (app, req, res) => {
      // eslint-disable-next-line
      app.children = (
        <Provider store={res.locals.reduxStore}>
          {app.children}
        </Provider>
      );
    });

    serverHandler.hooks.beforeHtmlRender.tapPromise('AddReduxPreloadedState', async (app, req, res) => {
      if (res.locals.reduxStore && res.locals.reduxStore.getState) {
        const reduxState = res.locals.reduxStore.getState();
        app.htmlProps.footer.push(
          <script
            key="reduxPreloadedState"
            dangerouslySetInnerHTML={{
              __html: `window.PAW__REDUX_PRELOADED_STATE = ${JSON.stringify(reduxState)}`,
            }}
          />,
        );
      }
    });
  }
}
