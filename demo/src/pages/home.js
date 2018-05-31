import HomeSkeleton from "../app/components/skeleton/home";

export default [
  {
    path: "/",
    component: import("../app/components/home"),
    skeleton: HomeSkeleton,
    loadData: () => {
      return new Promise(resolve => {
        setTimeout(() => {
          return resolve({
            name: "Tirth"
          });
        }, 2000);
      });
    },
    routes: [
      {
        exact: true,
        path: "/test",
        component: import("../app/components/home/test"),
        loadData: () => {
          return new Promise(resolve => {
            setTimeout(() => {
              return resolve({
                name: "Bodawala"
              });
            }, 2000);
          });
        },
      }
    ]
  },

];
