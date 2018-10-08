import BlogList from '../app/components/blog/list';
import BlogPost from '../app/components/blog/post';
import FullwidthLayout from '../app/components/layout/fullwidth';
import { getURLParam } from '../app/utils/url';

const routes = [
  {
    path: '/blog/?',
    exact: true,
    component: BlogList,
    preLoadData: async ({ api, url }) => {
      const page = getURLParam(url, 'page', 1);
      const [data, response] = await api.fetchWithResponse(`/posts?_embed&page=${page}`);
      return { posts: data, response };
    },
    layout: FullwidthLayout,
  },
  {
    path: '/blog/:slug',
    exact: true,
    component: BlogPost,
    layout: FullwidthLayout,
  },
];
export default routes;
