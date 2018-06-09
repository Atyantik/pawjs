import HomeSkeleton from "../app/components/skeleton/home";

export default [
  {
    path: "/",
    component: import("../app/components/home"),
    layout: import("../app/components/layout"),
    loadData: ({ updateSeo }) => {
      return new Promise(resolve => {
        setTimeout(() => {
          updateSeo({
            title: "Tirth Bodawala"
          });
          resolve({});
        }, 1000);
      });

    },
    skeleton: HomeSkeleton,
    exact: true,
  }
];
