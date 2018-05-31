import HomeRoutes from "./pages/home";

const appRoutes = [
  ...HomeRoutes
];

export default class Routes {

  apply(router) {
    // Adding application routes to application routes
    router.hooks.initRoutes.tap("AddAppRoutes", () => {
      router.addRoutes(appRoutes);
    });

  }
}