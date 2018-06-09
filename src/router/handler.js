import {AsyncSeriesHook, Tapable} from "tapable";
import AsyncRouteLoadErrorComponent from "../components/AsyncRouteLoadError";
import AsyncRouteLoaderComponent from "../components/AsyncRouteLoader";
import NotFoundComponent from "../components/NotFound";
import ErrorComponent from "../components/Error";
import RouteCompiler from "./compiler";
import _ from "lodash";


export default class RouteHandler extends Tapable {

  static defaultPwaSchema = {
    "name": "PawJS",
    "short_name": "PawJS",

    // Possible values ltr(left to right)/rtl(right to left)
    "dir": "ltr",

    // language: Default en-US
    "lang": "en-US",

    // Orientation of web-app possible:
    // any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary
    "orientation": "any",
    "start_url": "/",
    "background_color": "#fff",
    "theme_color": "#fff",
    "display": "standalone",
    "description": "A highly scalable & plug-able, Progressive Web Application foundation with the best Developer Experience."
  };

  static defaultSeoSchema = {
    title: "PawJS",
    description: RouteHandler.defaultPwaSchema.description,
    keywords: [],
    image: "",
    site_name: RouteHandler.defaultPwaSchema.name,
    twitter: {
      site: "",
      creator: ""
    },
    facebook: {
      admins: [],
    },
    type: "article", // article/product/music/video
    type_details: {
      section: "", // Lifestyle/sports/news
      published_time: "",
      modified_time: "",
    }
  };

  routes = [];
  components = {
    NotFoundComponent,
    ErrorComponent
  };

  constructor(options) {
    super();

    this.routeCompiler = new RouteCompiler({
      isServer: Boolean(options.isServer)
    });
    this.hooks = {
      "initRoutes": new AsyncSeriesHook(),
    };

    // Private methods
    let loadErrorComponent = AsyncRouteLoadErrorComponent;
    let loaderComponent = AsyncRouteLoaderComponent;
    let notFoundComponent = NotFoundComponent;
    let errorComponent = ErrorComponent;
    let seoSchema = Object.assign({}, RouteHandler.defaultSeoSchema);
    let pwaSchema = Object.assign({}, RouteHandler.defaultPwaSchema);

    let delay = 300;
    let timeout = 10000;

    this.setDefaultSeoSchema = (schema = {}) => {
      seoSchema = _.assignIn(seoSchema, schema);
    };

    this.getDefaultSeoSchema = () => {
      return _.assignIn({}, seoSchema);
    };

    this.setPwaSchema = (schema = {}) => {
      pwaSchema = _.assignIn(pwaSchema, schema);
    };

    this.getPwaSchema = () => {
      return _.assignIn({}, pwaSchema);
    };

    this.setDefaultLoadErrorComponent = component => {
      loadErrorComponent = component;
      return this;
    };

    this.getDefaultLoadErrorComponent = () => {
      return loadErrorComponent;
    };

    this.setDefaultLoaderComponent = component => {
      loaderComponent = component;
      return this;
    };

    this.getDefaultLoaderComponent = () => {
      return loaderComponent;
    };

    this.setDefaultAllowedLoadDelay = allowedDelay => {
      delay = allowedDelay;
      return this;
    };

    this.getDefaultAllowedLoadDelay = () => {
      return delay;
    };

    this.setDefaultLoadTimeout = loadTimeout => {
      timeout = loadTimeout;
      return this;
    };

    this.getDefaultLoadTimeout = () => {
      return timeout;
    };

    this.set404Component = (component = () => null) => {
      notFoundComponent = component;
    };
    this.get404Component = () => {
      return notFoundComponent;
    };

    this.setErrorComponent = (component = () => null) => {
      errorComponent = component;
    };

    this.getErrorComponent = () => {
      return errorComponent;
    };
  }

  addRoute(route) {
    const compiledRoute = this.routeCompiler.compileRoute(route, this);
    this.routes.push(compiledRoute);
    this.routes = _.uniq(this.routes);
  }

  addRoutes(routes) {
    const compiledRoutes = this.routeCompiler.compileRoutes(routes, this);
    this.routes = this.routes.concat(compiledRoutes);
    this.routes = _.uniq(this.routes);
  }

  addPlugin(plugin) {
    try {
      _.each(plugin.hooks, (hookValue, hookName) => {
        this.hooks[hookName] = hookValue;
      });
      plugin.apply && plugin.apply(this);
    } catch(ex) {
      // eslint-disable-next-line
      console.log(ex);
    }
  }

  getRoutes() {
    let routes = _.cloneDeep(this.routes);
    routes.push({
      component: this.get404Component()
    });
    return routes;
  }
}