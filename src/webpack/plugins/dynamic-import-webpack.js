const template = require("babel-template");
const syntax =  require("babel-plugin-syntax-dynamic-import");

const buildImport = template(`
  require(SOURCE)
`);

module.exports = () => ({
  inherits: syntax,

  visitor: {
    Import(path) {
      const newImport = buildImport({
        SOURCE: path.parentPath.node.arguments,
      });
      path.parentPath.replaceWith(newImport);
    },
  },
});