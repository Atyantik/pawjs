import RouteHandler from '@pawjs/pawjs/src/router/handler';
import GuestRoutes from './pages/guest';
import AuthRoutes from './pages/auth';
import SplashScreen from './pages/splash';

export default class Routes {
  // eslint-disable-next-line class-methods-use-this
  apply(router: RouteHandler) {
    const routes = [
      ...GuestRoutes,
      ...AuthRoutes,
      ...SplashScreen,
    ];

    router.hooks.initRoutes.tapPromise('AppRoutes', async () => {
      router.addRoutes(routes);
    });
  }
}
