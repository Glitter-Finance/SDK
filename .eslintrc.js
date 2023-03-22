module.exports = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["./packages/core/tsconfig.json", "./packages/server/tsconfig.json", "./tsconfig.base.json"],
        tsconfigRootDir: __dirname,
    },
    extends: ["eslint:recommended", "prettier", "plugin:@typescript-eslint/recommended"],
    plugins: ["@typescript-eslint", "import"],
    env: {
        es6: true,
        node: true,
    },
    rules: {
        "import/extensions": ["warn", "ignorePackages"],
        "import/no-named-as-default": "warn",
        "import/no-cycle": "warn",
        "import/no-unused-modules": "warn",
        "import/no-deprecated": "warn",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        "no-redeclare": "off",
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": "warn",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-pattern": "off",
        "no-empty": ["error", { allowEmptyCatch: true }],
        "@typescript-eslint/restrict-template-expressions": "off",
        "import/extensions": ["off"],
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
    },
    ignorePatterns: ["dist", "node_modules", "examples", "scripts", ".eslintrc.js"],
};
