import React from "react";
import _ from "lodash";
import Loadable from "../components/Loadable";

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

    let {
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

    // JSXifiable component object
    const Params = {
      errorComponent: error || routerService.getDefaultLoadErrorComponent(),
      skeletonComponent: skeleton || routerService.getDefaultLoaderComponent(),
      timeout: timeout || routerService.getDefaultLoadTimeout(),
      delay: delay || routerService.getDefaultAllowedLoadDelay()
    };


    let routeSeo = {};

    const updateSeo = (userSeoData = {}) => {
      routeSeo = Object.assign({}, seo, userSeoData);
    };

    const loadableComponent = Loadable.Map({
      loader: {
        // Router Component
        RouteComponent: async () => component,

        // Load Data with ability to update SEO
        LoadData: (typeof loadData !== "undefined" ? async (props = {}) => {
          return loadData({ updateSeo, ...props });
        } : async() => ({})),

        // Load layout as well
        Layout: async() => layout,
      },
      loading: (props) => {
        if (props.error) {
          return <Params.errorComponent {...props} />;
        } else if (props.pastDelay) {
          return <Params.skeletonComponent {...props} />;
        } else {
          return null;
        }
      },
      render(loaded, props) {
        let RouteComponent = loaded.RouteComponent.default? loaded.RouteComponent.default: loaded.RouteComponent;
        let LoadedData = loaded.LoadData;
        let Layout = loaded.Layout;
        if (Layout)  {
          Layout = loaded.Layout.default ? loaded.Layout.default : loaded.Layout;
          return (
            <Layout {...props} loadedData={LoadedData}>
              <RouteComponent {...props} loadedData={LoadedData}/>
            </Layout>
          );
        }
        return <RouteComponent {...props} loadedData={LoadedData}/>;
      },
      ...(route.modules? {modules: route.modules}: {}),
    });
    loadableComponent.compiled = true;
    return {
      getRouteSeo: () => {
        return Object.assign({}, routeSeo);
      },
      path,
      component: loadableComponent,
      seo: Object.assign({}, seo),
      ...others,
      ...(route.routes ? {routes: this.compileRoutes(route.routes, routerService)} : {}),
    };

  }
}