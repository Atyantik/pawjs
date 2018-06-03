import HomeSkeleton from "../app/components/skeleton/home";

export default [
  {
    path: "/",
    component: import("../app/components/home"),
    skeleton: HomeSkeleton,
    routes: [
      {
        exact: true,
        path: "/test",
        component: import("../app/components/home/test"),
      }
    ]
  },

];
