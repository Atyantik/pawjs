// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import ProjectClient from 'pawProjectClient';
// @ts-ignore
import ProjectRoutes from 'pawProjectRoutes';
import ClientHandler from './handler';
import RouteHandler from '../router/handler';

window.requestIdleCallback = window.requestIdleCallback
  || function requestIdleCallback(cb: any) {
    const start = Date.now();
    return setTimeout(
      () => {
        cb({
          didTimeout: false,
          timeRemaining() {
            return Math.max(0, 50 - (Date.now() - start));
          },
        });
      },
      1,
    );
  };

window.cancelIdleCallback = window.cancelIdleCallback
  || function cancelIdleCallback(id: any) {
    clearTimeout(id);
  };

// parse pawConfig
const env = JSON.parse(process.env.pawConfig || '');

// Initialize routing handler
const rHandler = new RouteHandler({
  env: { ...env },
});

// Add project routes, i.e. Project + `src/routes`
// as a plugin to the PawJS system
rHandler.addPlugin(new ProjectRoutes({ addPlugin: rHandler.addPlugin }));

const cHandler = new ClientHandler({
  env: { ...env },
});

let loadApplicationTimeout = 0;
const loadApplication = async (deadline: any) => {
  if ((deadline.timeRemaining() > 0 || deadline.didTimeout)) {

    cHandler.addPlugin(new ProjectClient({ addPlugin: cHandler.addPlugin }));
    let { URL } : any = window;
    if (typeof window.URL === 'undefined') {
      // @ts-ignore
      URL = await import('universal-url-lite');
      URL = URL.default ? URL.default : URL;
    }
    // Get all the routes async manner and execute the code!
    rHandler.hooks.initRoutes.callAsync(new URL(window.location.href), (err: Error) => {
      if (err) {
        // eslint-disable-next-line
        console.log(err);
        return;
      }
      cHandler.run({
        routeHandler: rHandler,
      }).catch((ex) => {
        // eslint-disable-next-line
        console.log(ex);
      });
    });
  } else {
    if (loadApplicationTimeout) {
      window.cancelIdleCallback(loadApplicationTimeout);
    }
    loadApplicationTimeout = window.requestIdleCallback(loadApplication, { timeout: 2000 });
  }
};
loadApplicationTimeout = window.requestIdleCallback(loadApplication, { timeout: 2000 });

export default cHandler;
