import React from 'react';
import { hot } from 'react-hot-loader/root';
import clientHandler from './app';

const App = props => props.children;
const HotApp = hot(App);

clientHandler.hooks.beforeRender.tap('AddHotModuleLoader', (app) => {
  // eslint-disable-next-line
  app.children = <HotApp>{app.children}</HotApp>;
});

if (module && module.hot && module.hot.accept) {
  module.hot.accept();
}
