import React from "react";
import _ from "lodash";
import Loadable from "../components/loadable";

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
      ...others
    } = route;

    // JSXifiable component object
    const Params = {
      errorComponent: error || routerService.getDefaultLoadErrorComponent(),
      skeletonComponent: skeleton || routerService.getDefaultLoaderComponent(),
      timeout: timeout || routerService.getDefaultLoadTimeout(),
      delay: delay || routerService.getDefaultAllowedLoadDelay()
    };

    const loadableComponent = Loadable.Map({
      loader: {
        RouteComponent: async () => component,
        LoadData: loadData ||  (async () => ({}))
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
        return <RouteComponent {...props} loadedData={LoadedData}/>;
      },
      ...(route.webpack? {webpack: route.webpack}: {}),
      ...(route.modules? {modules: route.modules}: {}),
    });
    loadableComponent.compiled = true;
    return {
      path,
      component: loadableComponent,
      seo: Object.assign({}, seo),
      ...others,
      ...(route.routes ? {routes: this.compileRoutes(route.routes, routerService)} : {}),
    };

  }
}