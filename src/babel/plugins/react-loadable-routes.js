const syntax = require('babel-plugin-syntax-dynamic-import');

module.exports = ({ types: t }) => ({
  inherits: syntax,

  visitor: {
    Import(path) {
      const source = path.parentPath.node.arguments[0].value;
      const { parent } = path.parentPath;
      if (parent.type === 'ObjectProperty') {
        if (parent.key.name === 'component' || parent.key.name === 'layout') {
          try {
            const obj = path.parentPath.parentPath;

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

      if (parent.type === 'ReturnStatement') {
        if (
          path.parentPath
          && path.parentPath.parentPath
          && path.parentPath.parentPath.parentPath
          && path.parentPath.parentPath.parentPath.parent
        ) {
          const { parent: p } = path.parentPath.parentPath.parentPath;
          if (!p.id) return;
          if (p.id.name === 'component' || p.id.name === 'layout') {
            try {
              const obj = path.parentPath.parentPath.parentPath.parentPath.parentPath;

              const propertiesMap = {};

              obj.container.forEach((property) => {
                propertiesMap[property.key.name] = property;
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
    },
  },
});
