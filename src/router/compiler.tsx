import { renderRoutes } from 'react-router-config';

import PreloadDataManager from '../utils/preloadDataManager';
import { Map as LoadableMap } from '../components/Loadable';
import { CompiledRoute, ReactComponent, Route } from '../@types/route';
import NotFoundError from '../errors/not-found';
import ServerError from '../errors/server';
import ErrorBoundary from '../components/ErrorBoundary';
import { IRouteHandler } from './IRouteHandler';

export default class RouteCompiler {
  public preloadManager: PreloadDataManager;

  constructor() {
    this.preloadManager = new PreloadDataManager();
  }

  compileRoutes(routes: Route[], routerService: IRouteHandler): CompiledRoute [] {
    return routes.map(r => this.compileRoute(r, routerService));
  }

  compileRoute(route: Route, routerService: IRouteHandler): CompiledRoute {
    const {
      exact,
      path,
      skeleton,
      error,
      timeout,
      delay,
      loadData,
      seo,
      component,
      layout,
      webpack,
      modules,
      props: routeProps,
      routes,
      selfManageNewProps,
    } = route;

    // JSXifiable component object
    const PARAMS = {
      errorComponent: error || routerService.getDefaultLoadErrorComponent(),
      notFoundComponent: error || routerService.get404Component(),
      skeletonComponent: skeleton || routerService.getDefaultLoaderComponent(),
      timeout: timeout || routerService.getDefaultLoadTimeout(),
      delay: typeof delay === 'undefined' ? routerService.getDefaultAllowedLoadDelay() : delay,
    };

    let routeSeo = { ...(seo || {}) };

    const updateSeo = (userSeoData = {}) => {
      routeSeo = { ...seo, ...userSeoData };
    };

    const preLoadData = async (props: any) => {
      if (typeof loadData !== 'undefined') {
        const extraParams = await this.preloadManager.getParams();
        const loadedData = await loadData({
          NotFoundError,
          ServerError,
          updateSeo,
          ...props,
          ...extraParams,
        });
        return loadedData || {};
      }
      return {};
    };
    const loadableComponent = LoadableMap({
      selfManageNewProps:
        typeof selfManageNewProps !== 'undefined'
          ? !!selfManageNewProps : false,
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
          error: err,
          pastDelay,
          timedOut,
          retry,
          history: propsHistory,
          location: propsLocation,
          match: propsMatch,
          route: propsRoute,
        } = props;
        if (err instanceof NotFoundError) {
          return (
            // @ts-ignore
            <PARAMS.notFoundComponent
              error={err}
              history={propsHistory}
              location={propsLocation}
              match={propsMatch}
              route={propsRoute}
            />
          );
        }
        if (err) {
          return (
            // @ts-ignore
            <PARAMS.errorComponent
              error={err}
              history={propsHistory}
              location={propsLocation}
              match={propsMatch}
              route={propsRoute}
            />
          );
        } if (pastDelay) {
          return (
            // @ts-ignore
            <PARAMS.skeletonComponent
              error={err}
              pastDelay={pastDelay}
              timedOut={timedOut}
              retry={retry}
              history={propsHistory}
              location={propsLocation}
              match={propsMatch}
              route={propsRoute}
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
        if (RouteComponent && RouteComponent.default) {
          // @ts-ignore
          components.routeComponent = RouteComponent.default;
        }
        const {
          props: componentProps,
          history: propsHistory,
          location: propsLocation,
          match: propsMatch,
          route: propsRoute,
        } = props;

        components.routeComponent = (
          <components.routeComponent
            {...componentProps}
            history={propsHistory}
            location={propsLocation}
            match={propsMatch}
            route={propsRoute}
            loadedData={loadedData}
          >
            {
              propsRoute && propsRoute.routes
                ? renderRoutes(propsRoute.routes)
                : undefined
            }
          </components.routeComponent>
        );

        if (components.layout) {
          return (
            <ErrorBoundary
              // @ts-ignore
              ErrorComponent={PARAMS.errorComponent}
            >
              <components.layout
                history={propsHistory}
                location={propsLocation}
                match={propsMatch}
                route={propsRoute}
                loadedData={loadedData}
              >
                {components.routeComponent}
              </components.layout>
            </ErrorBoundary>
          );
        }
        return (
          // @ts-ignore
          <ErrorBoundary ErrorComponent={PARAMS.errorComponent}>
            {components.routeComponent}
          </ErrorBoundary>
        );
      },
      ...(route.modules ? { modules: route.modules } : {}),
    });
    return {
      path,
      webpack,
      modules,
      exact,
      props: routeProps,
      getRouteSeo: () => ({ ...routeSeo }),
      component: loadableComponent,
      ...(routes ? { routes: this.compileRoutes(routes, routerService) } : {}),
    };
  }
}
