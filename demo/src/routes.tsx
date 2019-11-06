import RouteHandler from '@pawjs/pawjs/src/router/handler';

export default class Routes {
  apply(router: RouteHandler) {
    // Adding application routes to application routes
    router.hooks.initRoutes.tap('AddAppRoutes', () => {
      router.addRoutes([
        {
          path: '/test',
          component: () => import('./components/home'),
          // skeleton: () => 'Loading',
          // error: () => 'Error',
          // timeout: 1,
          // delay: 0,
          loadData: () => {},
          seo: {
            title: 'Minimal App',
          },
          layout: () => import('./components/home-layout'),
        },
      ]);
    });
  }
}
