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
            if (parent.key.name !== 'component') return;

            try {
              const obj = path.parentPath.parentPath.parentPath;

              const propertiesMap = {};
              const newContainer = [];

              obj.container.forEach((property) => {
                propertiesMap[property.key.name] = property.value.value;
                newContainer.push(property);
              });

              if (propertiesMap.modules) {
                return;
              }

              const moduleObj = t.objectProperty(
                t.identifier('modules'),
                t.arrayExpression([
                  t.StringLiteral(source),
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
      path.parentPath.replaceWith(newImport);
    },
  },
});
