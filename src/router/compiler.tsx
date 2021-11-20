import PreloadDataManager from '../utils/preloadDataManager';
import { Map as LoadableMap } from '../components/Loadable';
import { CompiledRoute, ReactComponent, Route } from '../@types/route';
import NotFoundError from '../errors/not-found';
import RedirectError from '../errors/redirect';
import { Redirect } from '../components/Paw';
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
      routes,
      selfManageNewProps,
    } = route;

    // If we have skeleton for route then default delay is 0
    const defaultDelay = skeleton ? 0 : routerService.getDefaultAllowedLoadDelay();

    // JSXifiable component object
    const PARAMS: any = {
      errorComponent: error || routerService.getDefaultLoadErrorComponent(),
      notFoundComponent: error || routerService.get404Component(),
      skeletonComponent: skeleton || routerService.getDefaultLoaderComponent(),
      timeout: timeout || routerService.getDefaultLoadTimeout(),
      delay: typeof delay === 'undefined' ? defaultDelay : delay,
    };

    let routeSeo = { ...(seo || {}) };

    const updateSeo = (userSeoData = {}) => {
      routeSeo = { ...seo, ...userSeoData };
    };

    const preLoadData = async (props: any) => {
      if (typeof loadData !== 'undefined') {
        const extraParams = await this.preloadManager.getParams();
        const loadedData = await loadData({
          updateSeo,
          ...(props?.match ? { match: props.match } : {}),
          ...extraParams,
        });
        return loadedData || {};
      }
      return {};
    };
    const loadableComponent = LoadableMap({
      path,
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
          route: propsRoute,
        } = props;
        if (err instanceof NotFoundError) {
          return (
            <PARAMS.notFoundComponent
              error={err}
              route={propsRoute}
            />
          );
        }
        if (err instanceof RedirectError) {
          return (
            <Redirect
              to={err.getRedirect()}
              statusCode={err.getStatusCode()}
            />
          );
        }
        if (err) {
          return (
            <PARAMS.errorComponent
              error={err}
              route={propsRoute}
            />
          );
        } if (pastDelay) {
          return (
            <PARAMS.skeletonComponent
              error={err}
              pastDelay={pastDelay}
              timedOut={timedOut}
              retry={retry}
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
        } = props;

        components.routeComponent = (
          <components.routeComponent
            {...componentProps}
            loadedData={loadedData}
          />
        );

        if (components.layout) {
          return (
            <components.layout
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
    return {
      path,
      webpack,
      modules,
      getRouteSeo: () => ({ ...routeSeo }),
      element: loadableComponent,
      ...(routes ? { routes: this.compileRoutes(routes, routerService) } : {}),
    };
  }
}
