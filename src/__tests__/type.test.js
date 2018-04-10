const {
  schemaToTemplateContext,
  makeExecutableSchema
} = require('graphql-codegen-core');
const {
  compileTemplate
} = require('graphql-codegen-compiler');
const configTypescript = require('../index');

describe('Multiple Files', () => {
  const compileAndBuildContext = (typeDefs) => {
    const schema = makeExecutableSchema({
      typeDefs,
      resolvers: {},
      allowUndefinedInResolve: true
    });

    return schemaToTemplateContext(schema);
  };

  let config;

  beforeAll(() => {
    config = configTypescript.default;

  });

  describe('Schema', () => {
    it('should generate the correct types when using only simple Query', () => {
      const templateContext = compileAndBuildContext(`
        type Address {
          id: Int!
        }
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');

    });

    it('should generate the correct types when directive entity', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
        }

        directive @entity on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive Column', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          name: String @Column
        }

        directive @entity on FIELD_DEFINITION
        directive @Column(dataType: String) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive Column with dataType', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          name: String @Column
          description: String @Column(dataType: "TEXT")
        }

        directive @entity on FIELD_DEFINITION
        directive @Column(dataType: String) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });
    it('should generate the correct types when directive BelongsTo', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          description: Description @BelongsTo
        }

        type Description {
          text: String
        }

        directive @entity on FIELD_DEFINITION
        directive @BelongsTo(foreignKey: String) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('description.type.ts');
      expect(compiled[1].content).toMatchSnapshot();
      expect(compiled[2].filename).toMatch('loaders.ts');
      expect(compiled[3].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive BelongsTo with foreignKey', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          description: Description @BelongsTo(foreignKey: "descriptionTestId")
        }

        type Description {
          text: String
        }

        directive @entity on FIELD_DEFINITION
        directive @BelongsTo(foreignKey: String) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('description.type.ts');
      expect(compiled[1].content).toMatchSnapshot();
      expect(compiled[2].filename).toMatch('loaders.ts');
      expect(compiled[3].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive HasMany with foreignKey', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          description: [Description] @HasMany(foreignKey: "addressId")
        }

        type Description {
          text: String
          addressId: Address @BelongsTo
        }

        directive @entity on FIELD_DEFINITION
        directive @BelongsTo(foreignKey: String) on FIELD_DEFINITION
        directive @HasMany(foreignKey: String!) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('description.type.ts');
      expect(compiled[1].content).toMatchSnapshot();
      expect(compiled[2].filename).toMatch('loaders.ts');
      expect(compiled[3].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive BelongsTo with foreignKey', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          description: [Description] @BelongsToMany(through: "AddressDescription")
        }

        type Description @entity {
          text: String
          Address: [Address] @BelongsToMany(through: "AddressDescription")
        }

        directive @entity on FIELD_DEFINITION
        directive @BelongsToMany(through: String!, foreignKey: String, otherKey: String) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('description.type.ts');
      expect(compiled[1].content).toMatchSnapshot();
      expect(compiled[2].filename).toMatch('loaders.ts');
      expect(compiled[3].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive BelongsTo with foreignKey, foreignKey and otherKey', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          description: [Description] @BelongsToMany(through: "AddressDescription", foreignKey: "addressTestId", otherKey:"descriptionTestId")
        }

        type Description @entity {
          text: String
          Address: [Address] @BelongsToMany(through: "AddressDescription", foreignKey: "descriptionTestId", otherKey:"addressTestId")
        }

        directive @entity on FIELD_DEFINITION
        directive @BelongsToMany(through: String!, foreignKey: String, otherKey: String) on FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(4);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('description.type.ts');
      expect(compiled[1].content).toMatchSnapshot();
      expect(compiled[2].filename).toMatch('loaders.ts');
      expect(compiled[3].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive cacheControl on object', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity @cacheControl {
          id: Int!
          name: String
        }

        directive @entity on FIELD_DEFINITION
        directive @cacheControl(maxAge: String, maxItems: Int) on OBJECT | FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive cacheControl on object with maxAge and maxItems', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity @cacheControl(maxAge: "2d", maxItems: 1000) {
          id: Int!
          name: String
        }

        directive @entity on FIELD_DEFINITION
        directive @cacheControl(maxAge: String, maxItems: Int) on OBJECT | FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive cacheControl on field', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          name: String @cacheControl
        }

        directive @entity on FIELD_DEFINITION
        directive @cacheControl(maxAge: String, maxItems: Int) on OBJECT | FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });

    it('should generate the correct types when directive cacheControl on field with maxAge and maxItems', () => {
      const templateContext = compileAndBuildContext(`
        type Address @entity {
          id: Int!
          name: String @cacheControl(maxAge: "2d", maxItems: 1000)
        }

        directive @entity on FIELD_DEFINITION
        directive @cacheControl(maxAge: String, maxItems: Int) on OBJECT | FIELD_DEFINITION
      `);
      const compiled = compileTemplate(config, templateContext);
      expect(compiled.length).toBe(3);
      expect(compiled[0].filename).toBe('address.type.ts');
      expect(compiled[0].content).toMatchSnapshot();
      expect(compiled[1].filename).toMatch('loaders.ts');
      expect(compiled[2].filename).toMatch('loaders-export.ts');
    });
  });
});
