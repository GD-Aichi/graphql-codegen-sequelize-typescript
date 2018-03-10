const fs = require('fs');

const enumTemplate = fs.readFileSync(__dirname + '/enum.handlebars', 'utf8');
const type = fs.readFileSync(__dirname + '/inputType.handlebars', 'utf8');
const interfaceTemplate = fs.readFileSync(__dirname + '/interface.handlebars', 'utf8');
const inputType = fs.readFileSync(__dirname + '/type.handlebars', 'utf8');
const scalar = fs.readFileSync(__dirname + '/scalar.handlebars', 'utf8');
const loaders = fs.readFileSync(__dirname + '/loaders.schema.handlebars', 'utf8');
const loadersExport = fs.readFileSync(__dirname + '/loaders-export.schema.handlebars', 'utf8');

const toMany = {};
const config = {
  inputType: 'MULTIPLE_FILES',
  templates: {
    type,
    inputType,
    interface: interfaceTemplate,
    enum: enumTemplate,
    scalar,
    'loaders.ts.schema.handlebars': loaders,
    'loaders-export.ts.schema.handlebars': loadersExport
  },
  flattenTypes: true,
  filesExtension: 'ts',
  customHelpers: {
    ifBelongsToMany: (context, tableName, options) => {
      if (
        context.directives &&
        context.directives['BelongsToMany'] &&
        context.directives['BelongsToMany'].through
      ) {
        const element = context.directives['BelongsToMany'];
        const through = element.through;

        const data = { through, relatedModelGetter: context.type };
        // not item in list
        if (!toMany[element.through] || toMany[element.through].tableName === tableName) {
          const foreignKey = element.foreignKey || tableName.toLowerCase() + 'Id';
          const otherKey = element.otherKey || context.type.toLowerCase() + 'Id';
          data.foreignKey = foreignKey;
          data.otherKey = otherKey;
          data.tableName = tableName;
          toMany[element.through] = data;
        } else {
          // item in list
          const foreignKey =
            element.foreignKey ||
            (toMany[through] && toMany[through].otherKey) ||
            tableName.toLowerCase() + 'Id';
          const otherKey =
            element.otherKey ||
            (toMany[through] && toMany[through].foreignKey) ||
            context.type.toLowerCase() + 'Id';
          data.foreignKey = foreignKey;
          data.otherKey = otherKey;
        }
        return options && options.fn ? options.fn({ ...data, ...context }) : '';
      }

      return options && options.inverse ? options.inverse(context) : '';
    },
    getRelations: (context, tableName, options) => {
      if (context && context !== '') {
        if (context.directives['BelongsToMany'] && context.directives['BelongsToMany'].through) {
          const through = context.directives['BelongsToMany'].through;

          if (toMany[through] && toMany[through].tableName === tableName) {
            return options && options.fn ? options.fn({ ...toMany[through], ...context }) : '';
          }
        }
      }
      return options && options.inverse ? options.inverse(context) : '';
    }
  }
};

module.exports = {
  default: config
};