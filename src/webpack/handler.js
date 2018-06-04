const {
  Tapable,
  SyncHook
} = require("tapable");
const _ = require("lodash");

export default class WebpackHandler extends Tapable {

  webConfigs = [];
  serverConfigs = [];

  constructor(options) {
    super();
    this.hooks = {
      "init": new SyncHook(),
    };
    this.options = options;
  }

}