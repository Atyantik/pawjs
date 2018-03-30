import HomeRoutes from "./pages/home";

const appRoutes = [
  ...HomeRoutes
];

export default class Routes {
  apply(serviceManager) {
    const RouterService = serviceManager.getService("router");

    // Adding application routes to application routes
    RouterService.hooks.init.tap("UpdateRoutes", routes => {
      // appRoutes.forEach(route => {
      //   Routes.addRoute(route);
      // });
      Routes.addRoutes(appRoutes);
    });

    //RouterService.
  }
}