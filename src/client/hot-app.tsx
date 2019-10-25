import React from 'react';
// tslint:disable-next-line:no-submodule-imports
import { hot } from 'react-hot-loader/root';
import clientHandler from './app';

// tslint:disable-next-line:variable-name
const App = (props: { children: any; }) => props.children;
// tslint:disable-next-line:variable-name
const HotApp = hot(App);

clientHandler.hooks.beforeRender.tap('AddHotModuleLoader', (app) => {
  // eslint-disable-next-line
  app.children = <HotApp>{app.children}</HotApp>;
});
// @ts-ignore
if (module && module.hot && module.hot.accept) {
  // @ts-ignore
  module.hot.accept();
}
