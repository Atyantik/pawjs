import HomeRoutes from "./pages/home";
import FeaturesRoutes from "./pages/features";

const appRoutes = [
  ...HomeRoutes,
  ...FeaturesRoutes
];

export default class Routes {

  apply(router) {

    router.setPwaSchema({
      "name": "PawJS",
      "short_name": "PawJS",

      // Possible values ltr(left to right)/rtl(right to left)
      "dir": "ltr",

      // language: Default en-US
      "lang": "en-US",
    });

    router.setDefaultSeoSchema({
      title: "ReactPWA | Progressive web application with React",
      site_name: "ReactPWA",
      description: "A highly scalable, Progressive Web Application foundation with the best Developer Experience built with React & Webpack.",
      twitter: {
        site: "@atyantik_tech",
        creator: "@tirthbodawala"
      },
      facebook: {
        admins: [
          "1501220844",
          "765904161",
        ],
      },
      meta: [
        {
          name:"theme-color",
          content: "#f6f6f6"
        }
      ],
    });
    // Adding application routes to application routes
    router.hooks.initRoutes.tap("AddAppRoutes", () => {
      router.addRoutes(appRoutes);
    });
  }
}