import HomeRoutes from "./pages/home";
import FeaturesRoutes from "./pages/features";

const appRoutes = [
  ...HomeRoutes,
  ...FeaturesRoutes
];

export default class Routes {

  apply(router) {
    // Adding application routes to application routes
    router.hooks.initRoutes.tap("AddAppRoutes", () => {
      router.addRoutes(appRoutes);
    });

  }
}