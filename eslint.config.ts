import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    plugins: {
      prettier,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: [""],
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    rules: {
      "prettier/prettier": "error",
      "no-control-regex": "off",
      // typescript-eslint only disables this for .ts files, and the commands
      // have no extension; the type aware rules cover the same ground.
      "no-undef": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",

      curly: "error",
      eqeqeq: "error",
      "default-case-last": "error",
      "guard-for-in": "error",
      "logical-assignment-operators": "error",
      "no-implicit-coercion": "error",
      "no-lonely-if": "error",
      "no-nested-ternary": "error",
      "no-param-reassign": "error",
      "no-unneeded-ternary": "error",
      "no-useless-rename": "error",
      "object-shorthand": "error",
      "prefer-object-spread": "error",
      "prefer-promise-reject-errors": "error",
      "prefer-template": "error",

      "@typescript-eslint/class-methods-use-this": [
        "error",
        { ignoreClassesThatImplementAnInterface: "public-fields" },
      ],
      "@typescript-eslint/consistent-type-exports": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/default-param-last": "error",
      "@typescript-eslint/method-signature-style": "error",
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
      "@typescript-eslint/no-empty-function": [
        "error",
        { allow: ["arrowFunctions", "methods"] },
      ],
      "@typescript-eslint/no-import-type-side-effects": "error",
      "@typescript-eslint/no-shadow": "error",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": [
        "error",
        { allowComparingNullableBooleansToTrue: false },
      ],
      "@typescript-eslint/no-unnecessary-parameter-property-assignment":
        "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/parameter-properties": [
        "error",
        { prefer: "parameter-property" },
      ],
      "@typescript-eslint/prefer-readonly": "error",
      "@typescript-eslint/return-await": ["error", "always"],

      "no-restricted-syntax": [
        "error",
        {
          selector: "ImportDeclaration[specifiers.length=0]",
          message: "Do not import for side effects. Import a name and call it.",
        },
        {
          selector: "Literal[value=null]",
          message: "Use 'undefined' instead of 'null'.",
        },
        {
          selector:
            "TSPropertySignature > TSTypeAnnotation > TSUnionType > TSUndefinedKeyword",
          message:
            "Do not use explicit `| undefined` on interface or type properties. Use the optional operator `?` instead (e.g., `field?: Type`).",
        },
        {
          selector:
            ":not(VariableDeclarator) > Identifier > TSTypeAnnotation > TSUnionType > TSUndefinedKeyword",
          message:
            "Do not use explicit `| undefined` on parameters. Mark the parameter as optional instead (e.g., `param?: Type`).",
        },
        {
          selector:
            'BinaryExpression[operator=/[=!]==/] > Identifier[name="undefined"]',
          message:
            "Do not compare `undefined`, ie. `if (x === undefined)`. Use truthy instead `if (x)`",
        },
        {
          selector:
            "ReturnStatement[argument.type='Identifier'][argument.name='undefined']",
          message:
            "Do not explicitly return undefined. Use a bare 'return;' instead.",
        },
        {
          selector:
            "BinaryExpression[left.property.name='length'][operator='==='][right.value=0]",
          message:
            "Do not use '.length === 0'. Use implicit falsy checks like '!x.length' instead.",
        },
        {
          selector:
            "MemberExpression[object.name=/^(describe|test|it)$/][property.name=/^(only|skip)$/]",
          message: "Do not commit focused or skipped tests (.only / .skip).",
        },
      ],
    },
  },
  eslintConfigPrettier,
);
