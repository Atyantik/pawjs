import React from 'react';
import PreloadDataManager from '../utils/preloadDataManager';
import Loadable from '../components/Loadable';
import { ReactComponent, Route } from '../@types/route';

export default class RouteCompiler {
  private preloadManager: PreloadDataManager;

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

    const loadableComponent = Loadable.Map({
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
        const {
          history,
          location,
          match,
          props: componentProps,
        } = props;
        if (Layout) {
          return (
            <Layout
              history={history}
              location={location}
              match={match}
              loadedData={loadedData}
            >
              // @ts-ignore
              <RouteComponent
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...componentProps}
                history={history}
                location={location}
                match={match}
                loadedData={loadedData}
              />
            </Layout>
          );
        }
        return (
          // @ts-ignore
          <RouteComponent
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...componentProps}
            history={history}
            location={location}
            match={match}
            loadedData={loadedData}
          />
        );
      },
      ...(route.modules ? { modules: route.modules } : {}),
    });
    loadableComponent.compiled = true;
    return {
      getRouteSeo: () => ({ ...routeSeo }),
      path,
      component: loadableComponent,
      seo: { ...seo },
      ...others,
      ...(route.routes ? { routes: this.compileRoutes(route.routes, routerService) } : {}),
    };
  }
}
