import HomeSkeleton from "../app/components/skeleton/home";

export default [
  {
    path: "/",
    component: import("../app/components/home"),
    skeleton: HomeSkeleton,
    exact: true,
  },
  {
    exact: true,
    path: "/test",
    component: import("../app/components/home/test"),
  }
];
