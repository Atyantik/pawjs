const template = require('babel-template');
const syntax = require('babel-plugin-syntax-dynamic-import');

const buildImport = template(`
  require(SOURCE)
`);

module.exports = ({ types: t }) => ({
  inherits: syntax,

  visitor: {
    Import(path) {
      const newImport = buildImport({
        SOURCE: path.parentPath.node.arguments,
      });
      const source = path.parentPath.node.arguments[0].value;

      if (path.parentPath.parent.type === 'ArrowFunctionExpression') {
        if (
          path.parentPath
          && path.parentPath.parentPath
          && path.parentPath.parentPath.parent
        ) {
          const { parent } = path.parentPath.parentPath;
          if (parent.type === 'ObjectProperty') {
            if (parent.key.name === 'component' || parent.key.name === 'layout') {
              try {
                const obj = path.parentPath.parentPath.parentPath;

                const propertiesMap = {};
                obj.container.forEach((property) => {
                  propertiesMap[property.key.name] = property.value.value;
                });

                let previousModules = [];
                if (propertiesMap.modules) {
                  previousModules = propertiesMap.modules.value.elements;
                }

                const moduleObj = t.objectProperty(
                  t.identifier('modules'),
                  t.arrayExpression([
                    t.StringLiteral(source),
                    ...previousModules,
                  ]),
                );
                obj.parentPath.pushContainer('properties', moduleObj);
              } catch (ex) {
                // eslint-disable-next-line
                console.log(ex);
              }
            }
          }
        }
      }
      path.parentPath.replaceWith(newImport);
    },
  },
});
