import React from "react";
import Loadable from "react-loadable";

export default class RouterCompiler {

  compileRoutes(routes) {
    return _.map(routes, (r) => {
      if (r.component.compiled) return r;
      return this.compileRoute(r);
    });
  }

  compileRoute(route) {
    const LibRouter = this.serviceManager.getService("router");

    const {path, skeleton, error, timeout, delay, loadData, seo, component, ...others} = route;

    // JSXifiable component object
    const Params = {
      errorComponent: error || LibRouter.getErrorComponent(),
      skeletonComponent: skeleton || LibRouter.getSkeletonComponent(),
      timeout: timeout || LibRouter.getTimeout(),
      delay: delay || LibRouter.getDelay()
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
        let RouteComponent = loaded.RouteComponent.default;
        let LoadedData = loaded.LoadData;
        return <RouteComponent {...props} loadedData={LoadedData}/>;
      },
    });
    loadableComponent.compiled = true;
    return {
      path,
      component: loadableComponent,
      seo: Object.assign({}, seo),
      ...others,
      ...(route.routes ? {routes: this.compileRoutes(route.routes)} : {})
    };

  }
}