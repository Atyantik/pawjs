import React from 'react';
import _ from 'lodash';
import Loadable from '../components/Loadable';

export default class RouteCompiler {
  constructor(options) {
    this.options = options;
  }

  compileRoutes(routes, routerService) {
    return _.map(routes, (r) => {
      if (r.component.compiled) return r;
      return this.compileRoute(r, routerService);
    });
  }

  compileRoute(route, routerService) {
    const {
      path,
      skeleton,
      error,
      timeout,
      delay,
      loadData,
      seo,
      component,
      layout,
      ...others
    } = route;

    let routeComponent = component;
    let routeLayout = layout;
    if (component && typeof component.then === 'function') {
      routeComponent = () => component;
    } else if (component && typeof component !== 'function') {
      routeComponent = async () => component;
    }
    if (layout && typeof layout.then === 'function') {
      routeLayout = () => layout;
    } else if (layout && typeof layout !== 'function') {
      routeLayout = async () => layout;
    }

    // JSXifiable component object
    const Params = {
      errorComponent: error || routerService.getDefaultLoadErrorComponent(),
      skeletonComponent: skeleton || routerService.getDefaultLoaderComponent(),
      timeout: timeout || routerService.getDefaultLoadTimeout(),
      delay: delay || routerService.getDefaultAllowedLoadDelay(),
    };

    let routeSeo = {};

    const updateSeo = (userSeoData = {}) => {
      routeSeo = Object.assign({}, seo, userSeoData);
    };

    const loadableComponent = Loadable.Map({
      timeout: Params.timeout,
      delay: Params.delay,
      loader: {
        // Router Component
        RouteComponent: routeComponent,

        // Load Data with ability to update SEO
        LoadData: (typeof loadData !== 'undefined'
          ? async (props = {}) => loadData({ updateSeo, ...props }) : async () => ({})),
        // Load layout as well
        ...(routeLayout ? { Layout: routeLayout } : {}),
      },
      loading: (props) => {
        const { err, pastDelay } = props;
        if (err) {
          return <Params.errorComponent {...props} />;
        } if (pastDelay) {
          return <Params.skeletonComponent {...props} />;
        }
        return null;
      },
      render(loaded, props) {
        const RouteComponent = loaded.RouteComponent.default
          ? loaded.RouteComponent.default : loaded.RouteComponent;
        const LoadedData = loaded.LoadData;
        let { Layout } = loaded;
        if (Layout) {
          Layout = loaded.Layout.default ? loaded.Layout.default : loaded.Layout;
          return (
            <Layout {...props} loadedData={LoadedData}>
              <RouteComponent {...props} loadedData={LoadedData} />
            </Layout>
          );
        }
        return <RouteComponent {...props} loadedData={LoadedData} />;
      },
      ...(route.modules ? { modules: route.modules } : {}),
    });
    loadableComponent.compiled = true;
    return {
      getRouteSeo: () => Object.assign({}, routeSeo),
      path,
      component: loadableComponent,
      seo: Object.assign({}, seo),
      ...others,
      ...(route.routes ? { routes: this.compileRoutes(route.routes, routerService) } : {}),
    };
  }
}
