import HomeSkeleton from "../app/components/skeleton/home";
// something

export default [
  {
    path: "/",
    component: import("../app/components/home"),
    layout: import("../app/components/layout"),
    skeleton: HomeSkeleton,
    exact: true,
  }
];
