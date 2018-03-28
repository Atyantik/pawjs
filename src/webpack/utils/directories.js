const path = require("path");
module.exports = {
  root: process.env.__project_root,
  src: path.resolve(process.env.__project_root, "src"),
  dist: path.join(process.env.__project_root, "dist")
};