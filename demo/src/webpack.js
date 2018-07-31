import SassPlugin from "../../packages/pawjs-sass/src/webpack";
export default class ClientWebpack {
  constructor({addPlugin}) {
    addPlugin(new SassPlugin);
  }
}