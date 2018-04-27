import HomeRoutes from "./pages/home";

const appRoutes = [
  ...HomeRoutes
];

export default class Routes {
  apply(serviceManager) {

    // Adding application routes to application routes
    serviceManager.hooks.initRoutes.tap("AddAppRoutes", Router => {
      Router.addRoutes(appRoutes);
    });

  }
}