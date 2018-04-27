import ServiceManager from "../../service-manager";
import ClientService from "../service";
import env from "../../config/index";

const manager = new ServiceManager({
  handler: ClientService,
  env,
});

try {
  let ProjectClient = require(`${process.env.__project_root}/src/client`);
  if (ProjectClient.default) ProjectClient = ProjectClient.default;

  let ProjectRoutes = require(`${process.env.__project_root}/src/routes`);
  if (ProjectRoutes.default) ProjectRoutes = ProjectRoutes.default;

  manager.addPlugin(new ProjectClient);
  manager.addPluginRoutes(new ProjectRoutes);
  manager.run();
} catch (ex) {
  // eslint-disable-next-line
  console.log(ex);
}

if (module.hot) module.hot.accept();