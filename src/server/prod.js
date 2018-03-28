import express from "express";
import _ from "lodash";
import server from "./dev";
import path from "path";
// the below assets will be added by webpack. Don't worry about it
import assets from "pwa-assets";

/**
 * defining the current dir
 */
let currentDir = __dirname;

// Set appropriate currentDir when build and run in production mode
const filename = _.find(process.argv, arg => {
  return arg.indexOf("/server.js") !== -1;
});
if (filename) {
  currentDir = path.dirname(filename);
}

const app = express();

const cacheTime = 86400000*30;     // 30 days;
app.use("/build", express.static(path.join(currentDir, "build"), {
  maxAge: cacheTime
}));

app.use((req, res, next) => {
  res.locals.assets = assets;
  res.locals.ssr = process.env.__config_serverSideRender;
  next();
});
app.use(server);

app.listen(process.env.__config_port, process.env.__config_host, () => {
  // eslint-disable-next-line
  console.log(`Listening to http://${process.env.__config_host}:${process.env.__config_port}`);
});
