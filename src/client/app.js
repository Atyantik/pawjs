import { URL } from 'universal-url-lite';
import assignIn from 'lodash/assignIn';
// eslint-disable-next-line
import ProjectClient from 'pawProjectClient';
// eslint-disable-next-line
import ProjectRoutes from 'pawProjectRoutes';
import ClientHandler from './handler';
import RouteHandler from '../router/handler';

// parse pawConfig
const env = JSON.parse(process.env.pawConfig);

const rHandler = new RouteHandler({
  env: assignIn({}, env),
});

rHandler.addPlugin(new ProjectRoutes({ addPlugin: rHandler.addPlugin }));

const cHandler = new ClientHandler({
  env: assignIn({}, env),
});
cHandler.addPlugin(new ProjectClient({ addPlugin: cHandler.addPlugin }));

// Get all the routes async manner and execute the code!
rHandler.hooks.initRoutes.callAsync(new URL(window.location.href), (err) => {
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
