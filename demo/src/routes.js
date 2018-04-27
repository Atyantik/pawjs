import HomeRoutes from "./pages/home";

const appRoutes = [
  ...HomeRoutes
];

export default class Routes {
  apply(serviceManager) {

    // Do anthing with user token

    let routes = [];
    serviceManager.hooks.initRoutes.tapPromise("GetRoutesBasedOnRole", () => {
      console.log("Will not get routes from API");
      return new Promise(resolve => {
        setTimeout(() => {
          console.log("got routes from API");
          routes = appRoutes;
          resolve();
        },2000);
      });

    });

    // Adding application routes to application routes
    serviceManager.hooks.initRoutes.tap("AddAppRoutes", Router => {
      console.log("got routes, adding them");
      Router.addRoutes(routes);
    });

  }
}