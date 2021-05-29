import { Hook, SyncHook } from 'tapable';

export interface IPlugin {
  hooks?: {
    [s: string]: Hook<string | string[], any> | SyncHook<string | string[], any>;
  } | void;
  apply?: (w: any) => void;
  [s: string]: any;
}
