import 'regenerator-runtime/runtime';

/**
 * Steps to do while importing the initial entry.tsx
 * - On document load, import client handler
 * - Import client from project root
 * - Import router if any and do preloading
 */
let loadApplicationTimeout = 0;

const loadApplication = async (deadline: any) => {
  let deadlineFallback = deadline;
  // If there is no deadline, just run as long as necessary.
  if (typeof deadline === 'undefined') {
    deadlineFallback = {
      didTimeout: false,
      timeRemaining() { return Number.MAX_VALUE; },
    };
  }
  if ((deadlineFallback.timeRemaining() > 0 || deadlineFallback.didTimeout)) {
    // Do something over here
    /**
     * - Import client handler async
     * - Import project client async
     * - Pass the project client to client handler
     * - Load the application
     */
    // @ts-ignore
    const { default: ProjectClient } = await (() => import('pawProjectClient'))();
    // @ts-ignore
    const { default: ProjectRoutes } = await (() => import('pawProjectRoutes'))();
    const { default: ClientHandler } = await (() => import('./handler'))();
    const { default: RouteHandler } = await (() => import('../router/handler'))();
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
    cHandler.addPlugin(new ProjectClient({ addPlugin: cHandler.addPlugin }));
    // Get all the routes async manner and execute the code!
    rHandler.hooks.initRoutes.callAsync(window.location.href, navigator.userAgent, (err) => {
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

window.requestIdleCallback = window.requestIdleCallback
  || function requestIdleCallback(cb, options) {
    return setTimeout(() => {
      const start = Date.now();
      cb({
        didTimeout: false,
        timeRemaining() {
          return Math.max(0, 50 - (Date.now() - start));
        },
      });
    }, typeof options !== 'undefined' ? options?.timeout ?? 0 : 0);
  };

window.cancelIdleCallback = window.cancelIdleCallback
  || function cancelIdleCallback(id: any) {
    clearTimeout(id);
  };

// If script is loaded via async method, the readyState of document is either
// complete or interactive and not loading, thus the event DOMContentLoaded does
// not fire.
if (document.readyState !== 'loading') {
  loadApplicationTimeout = window.requestIdleCallback(loadApplication, { timeout: 2000 });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    loadApplicationTimeout = window.requestIdleCallback(loadApplication, { timeout: 2000 });
  });
}

// @ts-ignore
if (module && module.hot && module.hot.accept) {
  // @ts-ignore
  module.hot.accept();
}
