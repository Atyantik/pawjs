import { ReactComponent } from '../@types/route';

export interface IRouteHandler {
  getDefaultSeoSchema: () => any;
  getPwaSchema: () => any;
  getDefaultLoadErrorComponent: () => ReactComponent;
  getDefaultLoadTimeout: () => number;
  get404Component: () => ReactComponent;
  getDefaultLoaderComponent: () => ReactComponent;
  getDefaultAllowedLoadDelay: () => number;
  getErrorComponent: () => ReactComponent;
}
