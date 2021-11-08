
import clientHandler from './app';

// tslint:disable-next-line:variable-name
const App = (props: { children: any; }) => props.children;

clientHandler.hooks.beforeRender.tap('AddHotModuleLoader', (app) => {
  // eslint-disable-next-line
  app.children = <App>{app.children}</App>;
});
// @ts-ignore
if (module && module.hot && module.hot.accept) {
  // @ts-ignore
  module.hot.accept();
}
