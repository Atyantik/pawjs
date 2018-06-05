const WebpackHandler = require("./handler");
const env = typeof process.env.NODE_ENV !== "undefined" ?
  process.env.NODE_ENV : "development";
const type = typeof process.env.WEBPACK_TARGET !== "undefined" ?
  process.env.WEBPACK_TARGET: "web";

const handler = new WebpackHandler();
module.exports = handler.getConfig(env, type);
