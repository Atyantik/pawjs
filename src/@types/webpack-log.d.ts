declare module 'webpack-log' {
  export default function (options: {
    name?: string,
    level?: string,
    unique?: boolean,
  }): 'webpack-log';
}
