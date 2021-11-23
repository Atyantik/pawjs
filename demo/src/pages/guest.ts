import fetch from 'cross-fetch';
import skeleton from '../components/skeleton';
import { IRoute } from '@pawjs/pawjs';
import FeaturesImage from '../resources/images/seo/features.png';
import CSSGlobalLocalImage from '../resources/images/seo/css-global-local.png';
import SkeletonImage from '../resources/images/seo/skeleton-loading.png';
import { toName } from '../utils/text';

const routes: IRoute[] = [
  {
    path: '/home',
    component: () => import('../components/home'),
    seo: {
      title: 'Home',
      description: 'Feature set offered by ReactPWA with pluggable @pawjs plugins. ReactPWA is highly customizable and once can achieve anything as it is extendable',
      image: FeaturesImage,
    },
  },
  {
    path: '/global-local-css',
    component: () => import('../components/global-local-css'),
    seo: {
      title: 'CSS - Globally & Locally',
      description: 'Sometimes we use global css classes like pad-10 but sometimes we need to write class names within modules that do not conflict with other modules, that is where local css comes into the picture',
      image: CSSGlobalLocalImage,
    },
  },
  {
    path: '/typescript-counter/:id',
    component: () => import('../components/typescript-counter'),
    seo: {
      title: 'TypeScript Counter',
      description: 'TypeScript is awesome and implementing it with React makes it more awesome. Checkout this simple counter example with react and typescript',
      image: CSSGlobalLocalImage,
    },
  },
  {
    path: '/skeleton-loading',
    loadData: async ({  }) => new Promise((r) => {
      setTimeout(() => {
        fetch('https://www.atyantik.com/wp-json/wp/v2/posts/?per_page=4&_fields[]=title&_fields[]=excerpt&_fields[]=jetpack_featured_media_url')
          .then(res => res.json())
          .then(res => r(res));
      }, 1000);
    }),
    component: () => import('../components/skeleton-loading'),
    skeleton,
    delay: 0,
    seo: {
      title: 'Skeleton Loading',
      description: 'Tired of adding ugly loaders? Do not let your users get confused, give them the best user experience of what is getting loaded. Use Skeleton Loading',
      image: SkeletonImage,
    },
  },
  {
    path: '/contribute',
    component: () => import('../components/contribute'),
    seo: {
      title: 'Contribute',
      description: 'Be a part of larger family. Get involved with us and support our project ReactPWA',
    },
  },
  {
    path: '/nested',
    component: () => import('../components/nested/index'),
    seo: {
      title: 'Nested routes',
      description: 'Create nested routes. Very handy when managing large applications.',
    },
    cache: false,
    routes: [
      {
        path: 'simple',
        component: () => import('../components/nested/simple'),
        cache: {
          // 1 year
          maxAge: 31536000000,
        },
        seo: {
          title: 'Simple | Nested routes',
          description: 'Create nested routes. Very handy when managing large applications.',
        },
      },
      {
        path: ':name',
        component: () => import('../components/nested/dynamic'),
        loadData: ({ updateSeo, match }) => {
          const { params: { name } } = match;
          updateSeo({
            title: `${toName(name || '')} | Nested routes`,
            description: `${toName(name || '')} in nested routes. You can add your own dynamic name in the url!`,
          });
          return {};
        },
      },
    ],
  },
];

export default routes;
