import { RouteComponentProps, RouteProps } from 'react-router';
import { ComponentType } from 'react';
import { RouteConfig } from 'react-router-config';

interface IComponent {
  loadedData?: any;
  match?: any;
  location?: any;
  route?: any;
}
export type ReactComponent = ComponentType<RouteComponentProps<any>>
  | ComponentType<any>
  | ComponentType<IComponent>;
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
}

export interface ICompiledRoute extends RouteConfig {
  path?: string;
  getRouteSeo: any;
  loadData?: any;
  component?: RouteConfig.component & { preload?: any };
  props?: {
    [key: string]: any;
  };
  routes?: CompiledRoute[];
  modules?: string[];
  webpack?: string[];
}

export type Route = IRoute ;
export type CompiledRoute = ICompiledRoute;
