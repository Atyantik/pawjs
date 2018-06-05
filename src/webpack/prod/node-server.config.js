const WebpackHandler = require("../handler");
const handler = new WebpackHandler();
module.exports = handler.getConfig("production", "server");