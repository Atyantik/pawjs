import React from 'react';
import PreloadDataManager from '../utils/preloadDataManager';
import { Map } from '../components/Loadable';
import { ReactComponent, Route } from '../@types/route';

export default class RouteCompiler {
  public preloadManager: PreloadDataManager;

  constructor() {
    this.preloadManager = new PreloadDataManager();
  }

  compileRoutes(routes: Route[], routerService: any): Route [] {
    return routes.map((r) => {
      if (r.component && r.compiled) return r;
      return this.compileRoute(r, routerService);
    });
  }

  compileRoute(route: Route, routerService: any): Route {
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

    // JSXifiable component object
    const PARAMS = {
      errorComponent: error || routerService.getDefaultLoadErrorComponent(),
      skeletonComponent: skeleton || routerService.getDefaultLoaderComponent(),
      timeout: timeout || routerService.getDefaultLoadTimeout(),
      delay: delay || routerService.getDefaultAllowedLoadDelay(),
    };

    let routeSeo = {};

    const updateSeo = (userSeoData = {}) => {
      routeSeo = { ...seo, ...userSeoData };
    };

    const preLoadData = async (props: any) => {
      if (typeof loadData !== 'undefined') {
        const extraParams = await this.preloadManager.getParams();
        return loadData({ updateSeo, ...props, ...extraParams });
      }
      return {};
    };
    const loadableComponent = Map({
      timeout: PARAMS.timeout,
      delay: PARAMS.delay,
      loader: {
        // Router Component
        RouteComponent: component,

        // Load Data with ability to update SEO
        LoadData: preLoadData,
        // Load layout as well
        ...(layout ? { Layout: layout } : {}),
      },
      loading: (props: any) => {
        const {
          err,
          pastDelay,
          info,
          isLoading,
          timedOut,
          retry,
          error: loadingError,
        } = props;
        if (err) {
          return <PARAMS.errorComponent error={loadingError} info={info} />;
        } if (pastDelay) {
          return (
            <PARAMS.skeletonComponent
              isLoading={isLoading}
              info={info}
              error={loadingError}
              pastDelay={pastDelay}
              timedOut={timedOut}
              retry={retry}
            />
          );
        }
        return null;
      },
      render(
        loaded: {
          Layout?: ReactComponent;
          RouteComponent?: ReactComponent;
          LoadData?: any;
        },
        props: any,
      ) {
        const { Layout, RouteComponent, LoadData: loadedData } = loaded;
        const components: any = {
          layout: Layout,
          routeComponent: RouteComponent,
        };
        // @ts-ignore
        if (Layout && Layout.default) {
          // @ts-ignore
          components.layout = Layout.default;
        }
        // @ts-ignore
        if (RouteComponent.default) {
          // @ts-ignore
          components.routeComponent = RouteComponent.default;
        }
        const {
          history,
          location,
          match,
          route: currentRoute,
          props: componentProps,
        } = props;

        components.routeComponent = (
          // @ts-ignore
          <components.routeComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...componentProps}
            history={history}
            location={location}
            match={match}
            route={currentRoute}
            loadedData={loadedData}
          />
        );

        if (components.layout) {
          return (
            <components.layout
              route={currentRoute}
              history={history}
              location={location}
              match={match}
              loadedData={loadedData}
            >
              {components.routeComponent}
            </components.layout>
          );
        }
        return components.routeComponent;
      },
      ...(route.modules ? { modules: route.modules } : {}),
    });
    // @ts-ignore
    loadableComponent.compiled = true;
    return {
      path,
      getRouteSeo: () => ({ ...routeSeo }),
      // @ts-ignore
      component: loadableComponent,
      seo: { ...seo },
      ...others,
      ...(route.routes ? { routes: this.compileRoutes(route.routes, routerService) } : {}),
    };
  }
}
