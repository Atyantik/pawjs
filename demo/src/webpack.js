import SassPlugin from "@pawjs/sass/webpack";
export default class ClientWebpack {
  constructor({addPlugin}) {
    addPlugin(new SassPlugin);
  }
}