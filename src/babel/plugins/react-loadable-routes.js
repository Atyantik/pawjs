const syntax = require('babel-plugin-syntax-dynamic-import');

module.exports = ({ types: t }) => ({
  inherits: syntax,

  visitor: {
    Import(path) {
      const source = path.parentPath.node.arguments[0].value;
      const { parent } = path.parentPath;

      if (parent.type === 'ObjectProperty') {
        if (parent.key.name !== 'component') return;

        try {
          const obj = path.parentPath.parentPath;

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

      if (parent.type === 'ReturnStatement') {
        if (
          path.parentPath
          && path.parentPath.parentPath
          && path.parentPath.parentPath.parentPath
          && path.parentPath.parentPath.parentPath.parent
        ) {
          const { parent: p } = path.parentPath.parentPath.parentPath;

          if (p.id.name !== 'component') return;

          try {
            const obj = path.parentPath.parentPath.parentPath.parentPath.parentPath;

            const propertiesMap = {};
            const newContainer = [];

            obj.container.forEach((property) => {
              propertiesMap[property.key.name] = property;
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
    },
  },
});
