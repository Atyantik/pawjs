// @ts-ignore
import { URL } from 'universal-url-lite';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import ProjectClient from 'pawProjectClient';
// @ts-ignore
import ProjectRoutes from 'pawProjectRoutes';
import ClientHandler from './handler';
import RouteHandler from '../router/handler';

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

export default cHandler;
