import { RouteMatch } from 'react-router';
import Cookies from 'universal-cookie';
import NotFoundError from './src/errors/not-found';
import RedirectError from './src/errors/redirect';
import ServerError from './src/errors/server';

export { Redirect, HttpStatus } from './src/components/Paw';
export { getTextFromHtml } from './src/plugins/html-to-text';
export { NotFoundError, RedirectError, ServerError };


type LoadDataParams = {
  match: RouteMatch,
  getCookies: () => Cookies,
  getSearchParams: () => URLSearchParams,
  [key: string]: any,
};
type LoadData = (args: LoadDataParams) => any;
export interface IRoute {
  path?: string;
  loadData?: LoadData;
  component?: () => Promise<{ default: React.ComponentType<any>; }>;
  skeleton?: React.ComponentType<any>,
  error?: React.ComponentType<any>,
  delay?: number,
  timeout?: number,
  selfManageNewProps?: boolean,
  layout?: () => Promise<{ default: React.ComponentType<any>; }> | React.ComponentType<any>,
  props?: {
    [key: string]: any;
  };
  seo?: {
    [key: string]: any;
  };
  routes?: IRoute[];
  index?: boolean;
  cache?: false | {
    maxAge: number,
  },
}
