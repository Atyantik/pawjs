import { RouteComponentProps, RouteProps } from 'react-router';
import { ComponentType } from 'react';

interface IComponent {
  loadedData?: any;
  match?: any;
  location?: any;
  route?: any;
}
export type ReactComponent = ComponentType<RouteComponentProps<any>>
| ComponentType<any>
| ComponentType<IComponent>
| ReactNode;
export type RouteComponent = Promise<ReactComponent>;

type DynamicImportType = () => Promise<{ default: ComponentType<any>; }>;

export interface IRoute extends RouteProps {
  exact?: boolean;
  compiled?: boolean;
  component?: DynamicImportType;
  delay?: number;
  error?: RouteComponent;
  layout?: DynamicImportType;
  loadData?: any;
  modules?: string [];
  path?: string;
  props?: {
    [key: string]: any;
  };
  routes?: (Route) [];
  seo?: any;
  skeleton?: ReactComponent;
  timeout?: number;
  webpack?: string [];
  selfManageNewProps?: boolean;
  cache?: false | {
    maxAge: number,
  },
}

export interface ICompiledRoute {
  path?: string;
  getRouteSeo: any;
  loadData?: any;
  element?: any & { preload?: any };
  props?: {
    [key: string]: any;
  };
  routes?: CompiledRoute[];
  modules?: string[];
  webpack?: string[];
  cache?: false | {
    maxAge: number,
  };
}

export type Route = IRoute ;
export type CompiledRoute = ICompiledRoute;
