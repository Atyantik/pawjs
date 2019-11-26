import RouteHandler from '@pawjs/pawjs/src/router/handler';
import PwaIcon192 from '../../src/resources/images/pwa-icon-192x192.png';
import PwaIcon512 from '../../src/resources/images/pwa-icon-512x512.png';

export default class Routes {
  pwaSchema = {
    name: process.env.APP_NAME,
    short_name: 'PawJS',

    // Possible values ltr(left to right)/rtl(right to left)
    dir: 'ltr',

    // language: Default en-US
    lang: 'en-US',

    // Orientation of web-app possible:
    // any, natural, landscape, landscape-primary, landscape-secondary,
    // portrait, portrait-primary, portrait-secondary
    orientation: 'any',
    start_url: '/',
    background_color: '#fff',
    theme_color: '#fff',
    display: 'standalone',
    description: 'A highly scalable & plug-able, Progressive Web Application'
      + ' foundation with the best Developer Experience.',
    icons: [
      {
        src: PwaIcon192,
        sizes: '192x192',
      },
      {
        src: PwaIcon512,
        sizes: '512x512',
      },
    ],
  };

  seoSchema = {
    title: process.env.APP_NAME,
    description: RouteHandler.defaultPwaSchema.description,
    keywords: [],
    image: '',
    site_name: RouteHandler.defaultPwaSchema.name,
  };

  // eslint-disable-next-line class-methods-use-this
  apply(router: RouteHandler) {
    // Adding application routes to application routes
    router.hooks.initRoutes.tap('AddAppRoutes', () => {
      router.addRoutes([
        {
          exact: true,
          path: '/',
          component: () => import('./components/home'),
          seo: {
            title: 'Minimal App',
          },
          loadData: async ({ updateSeo }) => {
            updateSeo({
              title: 'Load Data 1',
            });
            return {
              name: 'Tirth Bodawala',
            };
          },
          layout: () => import('./components/home-layout'),
        },
        {
          exact: true,
          path: '/page2',
          component: () => import('./components/home'),
          seo: {
            title: 'Minimal App 2',
          },
          props: {
            page: 2,
          },
          loadData: async ({ NotFoundError }) => {
            throw new NotFoundError('Ajay Patel Not Found!');
            return {
              name: 'Ajay Patel',
            };
          },
          layout: () => import('./components/home-layout'),
        },
        {
          exact: true,
          path: '/page3',
          component: () => import('./components/home'),
          seo: {
            title: 'Minimal App 3',
          },
          props: {
            page: 2,
          },
          loadData: async ({ NotFoundError }) => ({
            name: 'Kirtan Bodawala',
          }),
          layout: () => import('./components/home-layout'),
        },
        {
          exact: true,
          path: '/page4',
          component: () => import('./components/home'),
          seo: {
            title: 'Minimal App 3',
          },
          loadData: async ({ tirth }) => {
            console.log(tirth.id);
            return {
              name: 'Khushi Bodawala',
            };
          },
          layout: () => import('./components/home-layout'),
        },
      ]);
    });
  }
}
