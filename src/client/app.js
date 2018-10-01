import _ from 'lodash';
import ProjectClient from 'pawProjectClient';
import ClientHandler from './handler';
import RouteHandler from '../router/handler';
import env from '../config/index';

// eslint-disable-next-line
let ProjectRoutes = require(`${process.env.PROJECT_ROOT}/src/routes`);
if (ProjectRoutes.default) ProjectRoutes = ProjectRoutes.default;

const rHandler = new RouteHandler({
  env: _.assignIn({}, env),
});

rHandler.addPlugin(new ProjectRoutes({ addPlugin: rHandler.addPlugin }));

const cHandler = new ClientHandler({
  env: _.assignIn({}, env),
});
cHandler.addPlugin(new ProjectClient({ addPlugin: cHandler.addPlugin }));

// Get all the routes async manner and execute the code!
rHandler.hooks.initRoutes.callAsync((err) => {
  if (err) {
    // eslint-disable-next-line
    console.log(err);
    return;
  }
  cHandler.run({
    routeHandler: rHandler,
  });
});

export default cHandler;
